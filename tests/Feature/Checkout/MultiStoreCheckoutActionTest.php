<?php

use App\Actions\Checkout\ProcessMultiStoreCheckoutAction;
use App\Exceptions\InsufficientStockException;
use App\Models\Address;
use App\Models\Cart;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use App\Models\User;

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

/**
 * Build a complete store with seller, product, SKU, and cart item for a buyer.
 *
 * @return array{store: Store, product: Product, sku: ProductSku, cart: Cart}
 */
function makeStoreWithCartItem(User $buyer, int $stock = 10, int $weightGram = 500, int $quantity = 2): array
{
    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);

    $product = Product::factory()->create([
        'store_id' => $store->id,
        'title' => fake()->words(3, true),
        'price' => 100000,
        'has_variants' => true,
    ]);

    $sku = ProductSku::factory()->create([
        'product_id' => $product->id,
        'stock' => $stock,
        'price' => 100000,
        'weight_gram' => $weightGram,
        'combination_key' => 'Hitam-M',
    ]);

    $cart = Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'product_sku_id' => $sku->id,
        'quantity' => $quantity,
        'selected' => true,
    ]);

    return compact('store', 'product', 'sku', 'cart');
}

function makeAddress(User $user): Address
{
    return Address::factory()->create([
        'user_id' => $user->id,
        'label' => 'Rumah',
        'receiver' => 'Budi Santoso',
        'phone' => '08123456789',
        'full_address' => 'Jl. Sudirman No. 1',
        'is_main' => true,
    ]);
}

// ---------------------------------------------------------------------------
// ProcessMultiStoreCheckoutAction — Direct Action Tests
// ---------------------------------------------------------------------------

describe('ProcessMultiStoreCheckoutAction', function () {

    it('creates 1 OrderGroup and N SubOrders for N stores', function () {
        $buyer = User::factory()->create();

        $itemA = makeStoreWithCartItem($buyer, stock: 10, quantity: 2);
        $itemB = makeStoreWithCartItem($buyer, stock: 5, quantity: 1);

        $address = makeAddress($buyer);

        $payload = [
            'address_id' => $address->id,
            'stores' => [
                ['store_id' => $itemA['store']->id, 'courier_name' => 'jne',     'courier_service' => 'REG'],
                ['store_id' => $itemB['store']->id, 'courier_name' => 'sicepat', 'courier_service' => 'SIUNT'],
            ],
        ];

        /** @var ProcessMultiStoreCheckoutAction $action */
        $action = app(ProcessMultiStoreCheckoutAction::class);
        $orderGroup = $action->execute($buyer, $payload);

        expect($orderGroup)->toBeInstanceOf(OrderGroup::class)
            ->and($orderGroup->user_id)->toBe($buyer->id)
            ->and($orderGroup->payment_status)->toBe('pending');

        // Exactly 2 sub orders
        $subOrders = SubOrder::where('order_group_id', $orderGroup->id)->get();
        expect($subOrders)->toHaveCount(2);

        // Each sub order has exactly 1 item
        foreach ($subOrders as $subOrder) {
            $items = SubOrderItem::where('sub_order_id', $subOrder->id)->get();
            expect($items)->not->toBeEmpty();
        }
    });

    it('decrements SKU stock for each checkout item', function () {
        $buyer = User::factory()->create();
        $address = makeAddress($buyer);
        $item = makeStoreWithCartItem($buyer, stock: 10, quantity: 3);

        $originalStock = $item['sku']->stock; // 10

        $payload = [
            'address_id' => $address->id,
            'stores' => [
                ['store_id' => $item['store']->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
            ],
        ];

        app(ProcessMultiStoreCheckoutAction::class)->execute($buyer, $payload);

        $remainingStock = $item['sku']->fresh()->stock;
        expect($remainingStock)->toBe($originalStock - 3);
    });

    it('removes selected cart items after successful checkout', function () {
        $buyer = User::factory()->create();
        $address = makeAddress($buyer);
        $item = makeStoreWithCartItem($buyer, stock: 5, quantity: 1);

        // Also create an unselected cart item — must NOT be deleted
        $unselectedProduct = Product::factory()->create(['store_id' => $item['store']->id]);
        $unselectedSku = ProductSku::factory()->create(['product_id' => $unselectedProduct->id, 'stock' => 5]);
        Cart::factory()->create([
            'user_id' => $buyer->id,
            'product_id' => $unselectedProduct->id,
            'product_sku_id' => $unselectedSku->id,
            'selected' => false,
        ]);

        $payload = [
            'address_id' => $address->id,
            'stores' => [
                ['store_id' => $item['store']->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
            ],
        ];

        app(ProcessMultiStoreCheckoutAction::class)->execute($buyer, $payload);

        // Selected cart deleted
        expect(Cart::where('user_id', $buyer->id)->where('selected', true)->count())->toBe(0);
        // Unselected cart preserved
        expect(Cart::where('user_id', $buyer->id)->where('selected', false)->count())->toBe(1);
    });

    it('throws InsufficientStockException and rolls back when stock is insufficient', function () {
        $buyer = User::factory()->create();
        $address = makeAddress($buyer);
        // Stock = 1, quantity requested = 3 → should fail
        $item = makeStoreWithCartItem($buyer, stock: 1, quantity: 3);

        $stockBefore = $item['sku']->stock;

        $payload = [
            'address_id' => $address->id,
            'stores' => [
                ['store_id' => $item['store']->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
            ],
        ];

        expect(fn () => app(ProcessMultiStoreCheckoutAction::class)->execute($buyer, $payload))
            ->toThrow(InsufficientStockException::class);

        // Rollback: stock unchanged
        expect($item['sku']->fresh()->stock)->toBe($stockBefore);

        // Rollback: no OrderGroup created
        expect(OrderGroup::where('user_id', $buyer->id)->count())->toBe(0);

        // Rollback: cart items still present
        expect(Cart::where('user_id', $buyer->id)->where('selected', true)->count())->toBe(1);
    });

    it('calculates SubOrder shipping cost and total correctly', function () {
        $buyer = User::factory()->create();
        $address = makeAddress($buyer);

        // 1 item: weight 500g × qty 2 = 1000g → ceil(1000/1000) = 1 kg
        // JNE REG: base_rate = 8000 → shipping_cost = 8000
        $item = makeStoreWithCartItem($buyer, stock: 10, weightGram: 500, quantity: 2);

        $payload = [
            'address_id' => $address->id,
            'stores' => [
                ['store_id' => $item['store']->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
            ],
        ];

        app(ProcessMultiStoreCheckoutAction::class)->execute($buyer, $payload);

        $subOrder = SubOrder::first();
        expect($subOrder)->not->toBeNull()
            ->and((int) $subOrder->shipping_cost)->toBe(8000)
            ->and($subOrder->courier_name)->toBe('jne')
            ->and($subOrder->courier_service)->toBe('REG');
    });

    it('grand total on OrderGroup is sum of all store subtotals + shipping costs', function () {
        $buyer = User::factory()->create();
        $address = makeAddress($buyer);

        // Store A: price 100000 × qty 2 = 200000. weight 500×2 = 1000g → 1kg → JNE REG 8000
        // Store B: price 100000 × qty 1 = 100000. weight 500×1 = 500g  → 1kg → SiCepat SIUNT 7000
        $itemA = makeStoreWithCartItem($buyer, stock: 10, weightGram: 500, quantity: 2);
        $itemB = makeStoreWithCartItem($buyer, stock: 10, weightGram: 500, quantity: 1);

        $payload = [
            'address_id' => $address->id,
            'stores' => [
                ['store_id' => $itemA['store']->id, 'courier_name' => 'jne',     'courier_service' => 'REG'],
                ['store_id' => $itemB['store']->id, 'courier_name' => 'sicepat', 'courier_service' => 'SIUNT'],
            ],
        ];

        $orderGroup = app(ProcessMultiStoreCheckoutAction::class)->execute($buyer, $payload);

        $expectedTotal = (200000 + 8000) + (100000 + 7000); // 315000
        expect((int) $orderGroup->total_amount)->toBe($expectedTotal);
    });

    it('persists SubOrderItems with correct price snapshot and weight', function () {
        $buyer = User::factory()->create();
        $address = makeAddress($buyer);
        $item = makeStoreWithCartItem($buyer, stock: 5, weightGram: 300, quantity: 2);

        $payload = [
            'address_id' => $address->id,
            'stores' => [
                ['store_id' => $item['store']->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
            ],
        ];

        app(ProcessMultiStoreCheckoutAction::class)->execute($buyer, $payload);

        $subOrderItem = SubOrderItem::first();
        expect($subOrderItem)->not->toBeNull()
            ->and($subOrderItem->product_id)->toBe($item['product']->id)
            ->and($subOrderItem->product_sku_id)->toBe($item['sku']->id)
            ->and((int) $subOrderItem->price)->toBe(100000)
            ->and($subOrderItem->quantity)->toBe(2)
            ->and((int) $subOrderItem->total_price)->toBe(200000)
            ->and($subOrderItem->weight_gram)->toBe(300);
    });
});

// ---------------------------------------------------------------------------
// HTTP Layer — Form Request Anti-IDOR & Route Tests
// ---------------------------------------------------------------------------

describe('checkout.processMulti HTTP endpoint', function () {

    it('guest is redirected to login', function () {
        $this->post(route('checkout.processMulti'), [])->assertRedirect(route('login'));
    });

    it('rejects address_id belonging to another user (Anti-IDOR)', function () {
        $buyer = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherAddress = makeAddress($otherUser); // address NOT owned by $buyer

        $seller = User::factory()->create();
        $store = Store::factory()->create(['user_id' => $seller->id]);
        $product = Product::factory()->create(['store_id' => $store->id]);
        $sku = ProductSku::factory()->create(['product_id' => $product->id, 'stock' => 5]);
        Cart::factory()->create([
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'product_sku_id' => $sku->id,
            'selected' => true,
        ]);

        $response = $this->actingAs($buyer)->post(route('checkout.processMulti'), [
            'address_id' => $otherAddress->id,
            'stores' => [
                ['store_id' => $store->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
            ],
        ]);

        $response->assertSessionHasErrors('address_id');
    });

    it('rejects invalid courier_name', function () {
        $buyer = User::factory()->create();
        $address = makeAddress($buyer);
        $seller = User::factory()->create();
        $store = Store::factory()->create(['user_id' => $seller->id]);

        $response = $this->actingAs($buyer)->post(route('checkout.processMulti'), [
            'address_id' => $address->id,
            'stores' => [
                ['store_id' => $store->id, 'courier_name' => 'invalid_courier', 'courier_service' => 'REG'],
            ],
        ]);

        $response->assertSessionHasErrors('stores.0.courier_name');
    });

    it('rejects empty stores array', function () {
        $buyer = User::factory()->create();
        $address = makeAddress($buyer);

        $response = $this->actingAs($buyer)->post(route('checkout.processMulti'), [
            'address_id' => $address->id,
            'stores' => [],
        ]);

        $response->assertSessionHasErrors('stores');
    });

    it('successful multi-store checkout redirects to dashboard', function () {
        $buyer = User::factory()->create();
        $address = makeAddress($buyer);
        $item = makeStoreWithCartItem($buyer, stock: 10, quantity: 1);

        $response = $this->actingAs($buyer)->post(route('checkout.processMulti'), [
            'address_id' => $address->id,
            'stores' => [
                ['store_id' => $item['store']->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
            ],
        ]);

        $response->assertRedirect(route('dashboard'));
        expect(OrderGroup::where('user_id', $buyer->id)->count())->toBe(1);
    });
});
