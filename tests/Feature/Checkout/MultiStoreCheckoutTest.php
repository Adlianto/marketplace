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
// Scoped Test Factory Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a merchant user, their store, a product with SKU, and a cart item for a buyer.
 *
 * @return array{
 *   seller: User,
 *   store: Store,
 *   product: Product,
 *   sku: ProductSku,
 *   cart: Cart
 * }
 */
function createStoreSkuAndCart(
    User $buyer,
    int $stock = 10,
    int $price = 50000,
    int $weightGram = 300,
    int $quantity = 2,
    bool $selected = true
): array {
    $seller = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $seller->id,
        'city' => 'Kota Surabaya',
    ]);

    $product = Product::factory()->create([
        'store_id' => $store->id,
        'title' => fake()->words(3, true),
        'price' => $price,
        'has_variants' => true,
    ]);

    $sku = ProductSku::factory()->create([
        'product_id' => $product->id,
        'stock' => $stock,
        'price' => $price,
        'weight_gram' => $weightGram,
        'combination_key' => 'Biru-XL',
    ]);

    $cart = Cart::factory()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'product_sku_id' => $sku->id,
        'quantity' => $quantity,
        'selected' => $selected,
    ]);

    return compact('seller', 'store', 'product', 'sku', 'cart');
}

/**
 * Creates a valid delivery address for the given user.
 */
function createBuyerAddress(User $user, array $overrides = []): Address
{
    return Address::factory()->create(array_merge([
        'user_id' => $user->id,
        'label' => 'Kantor',
        'receiver' => 'Jane Doe',
        'phone' => '081298765432',
        'full_address' => 'Gedung Cyber 2 Lt. 15, Jl. HR Rasuna Said, Jakarta Selatan',
        'is_main' => true,
    ], $overrides));
}

// ---------------------------------------------------------------------------
// 1. Multi-Store Split Checkout Creation
// ---------------------------------------------------------------------------

describe('1. Multi-Store Split Checkout Creation', function () {

    it('creates exactly 1 OrderGroup and 2 SubOrders when checking out items from Store A and Store B', function () {
        $buyer = User::factory()->create();
        $address = createBuyerAddress($buyer);

        // Store A item: Qty 2 @ 100.000, weight 400g -> total 800g -> 1kg JNE REG (8.000)
        $storeA = createStoreSkuAndCart($buyer, stock: 20, price: 100000, weightGram: 400, quantity: 2);
        // Store B item: Qty 3 @ 50.000, weight 500g -> total 1500g -> 2kg SiCepat SIUNT (14.000)
        $storeB = createStoreSkuAndCart($buyer, stock: 15, price: 50000, weightGram: 500, quantity: 3);

        $payload = [
            'address_id' => $address->id,
            'stores' => [
                [
                    'store_id' => $storeA['store']->id,
                    'courier_name' => 'jne',
                    'courier_service' => 'REG',
                ],
                [
                    'store_id' => $storeB['store']->id,
                    'courier_name' => 'sicepat',
                    'courier_service' => 'SIUNT',
                ],
            ],
            'payment_method' => 'qris',
            'notes' => 'Tolong pisahkan invoice pengiriman.',
        ];

        $response = $this->actingAs($buyer)->post(route('checkout.processMulti'), $payload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('dashboard'));

        // 1. Exactly 1 OrderGroup created with pending status
        $orderGroups = OrderGroup::where('user_id', $buyer->id)->get();
        expect($orderGroups)->toHaveCount(1);

        /** @var OrderGroup $orderGroup */
        $orderGroup = $orderGroups->first();
        expect($orderGroup->payment_status)->toBe('pending')
            ->and($orderGroup->group_code)->toStartWith('OG-');

        // 2. Exactly 2 SubOrders linked to the OrderGroup
        $subOrders = SubOrder::where('order_group_id', $orderGroup->id)->get();
        expect($subOrders)->toHaveCount(2);

        $subOrderStores = $subOrders->pluck('store_id')->all();
        expect($subOrderStores)->toContain($storeA['store']->id)
            ->and($subOrderStores)->toContain($storeB['store']->id);

        // 3. Verify each SubOrder and its SubOrderItem details
        $subOrderA = $subOrders->firstWhere('store_id', $storeA['store']->id);
        expect($subOrderA)->not->toBeNull()
            ->and($subOrderA->user_id)->toBe($buyer->id)
            ->and($subOrderA->address_id)->toBe($address->id)
            ->and($subOrderA->courier_name)->toBe('jne')
            ->and($subOrderA->courier_service)->toBe('REG')
            ->and((int) $subOrderA->items_subtotal)->toBe(200000)
            ->and((int) $subOrderA->shipping_cost)->toBe(8000)
            ->and((int) $subOrderA->total_amount)->toBe(208000)
            ->and($subOrderA->status)->toBe('pending');

        $subOrderItemsA = SubOrderItem::where('sub_order_id', $subOrderA->id)->get();
        expect($subOrderItemsA)->toHaveCount(1);
        $itemA = $subOrderItemsA->first();
        expect($itemA->product_sku_id)->toBe($storeA['sku']->id)
            ->and($itemA->quantity)->toBe(2)
            ->and((int) $itemA->price)->toBe(100000)
            ->and((int) $itemA->total_price)->toBe(200000)
            ->and($itemA->weight_gram)->toBe(400);

        $subOrderB = $subOrders->firstWhere('store_id', $storeB['store']->id);
        expect($subOrderB)->not->toBeNull()
            ->and($subOrderB->user_id)->toBe($buyer->id)
            ->and($subOrderB->address_id)->toBe($address->id)
            ->and($subOrderB->courier_name)->toBe('sicepat')
            ->and($subOrderB->courier_service)->toBe('SIUNT')
            ->and((int) $subOrderB->items_subtotal)->toBe(150000)
            ->and((int) $subOrderB->shipping_cost)->toBe(14000)
            ->and((int) $subOrderB->total_amount)->toBe(164000)
            ->and($subOrderB->status)->toBe('pending');

        $subOrderItemsB = SubOrderItem::where('sub_order_id', $subOrderB->id)->get();
        expect($subOrderItemsB)->toHaveCount(1);
        $itemB = $subOrderItemsB->first();
        expect($itemB->product_sku_id)->toBe($storeB['sku']->id)
            ->and($itemB->quantity)->toBe(3)
            ->and((int) $itemB->price)->toBe(50000)
            ->and((int) $itemB->total_price)->toBe(150000)
            ->and($itemB->weight_gram)->toBe(500);

        // 4. Grand total of OrderGroup matches the sum of all SubOrders total_amount
        $expectedGrandTotal = (int) $subOrderA->total_amount + (int) $subOrderB->total_amount;
        expect((int) $orderGroup->total_amount)->toBe($expectedGrandTotal)
            ->and((int) $orderGroup->total_amount)->toBe(372000);

        // 5. Selected cart items belonging to user are cleaned up (deleted)
        expect(Cart::where('user_id', $buyer->id)->where('selected', true)->count())->toBe(0);
    });

    it('cleans up only selected cart items and preserves unselected items after checkout', function () {
        $buyer = User::factory()->create();
        $address = createBuyerAddress($buyer);

        $storeA = createStoreSkuAndCart($buyer, stock: 10, quantity: 1, selected: true);

        // Create an unselected cart item for the same buyer
        $unselectedStore = createStoreSkuAndCart($buyer, stock: 10, quantity: 2, selected: false);

        $payload = [
            'address_id' => $address->id,
            'stores' => [
                ['store_id' => $storeA['store']->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
            ],
        ];

        $this->actingAs($buyer)->post(route('checkout.processMulti'), $payload)->assertRedirect(route('dashboard'));

        // Selected cart is gone
        expect(Cart::where('id', $storeA['cart']->id)->exists())->toBeFalse();

        // Unselected cart is preserved
        expect(Cart::where('id', $unselectedStore['cart']->id)->exists())->toBeTrue();
    });
});

// ---------------------------------------------------------------------------
// 2. Pessimistic Lock & Concurrency Defense (Stock Clamping)
// ---------------------------------------------------------------------------

describe('2. Pessimistic Lock & Concurrency Defense (Stock Clamping)', function () {

    it('allows first user to claim limited stock while second user is rejected without overselling', function () {
        $seller = User::factory()->create();
        $store = Store::factory()->create(['user_id' => $seller->id]);
        $product = Product::factory()->create([
            'store_id' => $store->id,
            'price' => 250000,
            'has_variants' => true,
        ]);

        // SKU with EXACTLY 1 item left in stock
        $limitedSku = ProductSku::factory()->create([
            'product_id' => $product->id,
            'sku_code' => 'SKU-LIMITED-EDITION',
            'stock' => 1,
            'price' => 250000,
            'weight_gram' => 500,
            'combination_key' => 'Emas-Limited',
        ]);

        // Buyer 1 has 1 qty in cart
        $buyer1 = User::factory()->create();
        $address1 = createBuyerAddress($buyer1);
        Cart::factory()->create([
            'user_id' => $buyer1->id,
            'product_id' => $product->id,
            'product_sku_id' => $limitedSku->id,
            'quantity' => 1,
            'selected' => true,
        ]);

        // Buyer 2 also has 1 qty in cart for the same SKU
        $buyer2 = User::factory()->create();
        $address2 = createBuyerAddress($buyer2);
        Cart::factory()->create([
            'user_id' => $buyer2->id,
            'product_id' => $product->id,
            'product_sku_id' => $limitedSku->id,
            'quantity' => 1,
            'selected' => true,
        ]);

        $payload1 = [
            'address_id' => $address1->id,
            'stores' => [
                ['store_id' => $store->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
            ],
        ];

        $payload2 = [
            'address_id' => $address2->id,
            'stores' => [
                ['store_id' => $store->id, 'courier_name' => 'sicepat', 'courier_service' => 'SIUNT'],
            ],
        ];

        /** @var ProcessMultiStoreCheckoutAction $action */
        $action = app(ProcessMultiStoreCheckoutAction::class);

        // 1. Buyer 1 checks out first
        $orderGroup1 = $action->execute($buyer1, $payload1);

        expect($orderGroup1)->toBeInstanceOf(OrderGroup::class)
            ->and($orderGroup1->user_id)->toBe($buyer1->id);

        // Verify stock dropped from 1 to exactly 0
        $remainingStockAfterBuyer1 = $limitedSku->fresh()->stock;
        expect($remainingStockAfterBuyer1)->toBe(0);

        // 2. Buyer 2 attempts checkout for the same exhausted SKU
        expect(fn () => $action->execute($buyer2, $payload2))
            ->toThrow(
                InsufficientStockException::class,
                "Stok SKU {$limitedSku->sku_code} tidak mencukupi."
            );

        // 3. Concurrency defense: Stock MUST NOT become negative (-1), must remain clamped at 0
        $finalStock = $limitedSku->fresh()->stock;
        expect($finalStock)->toBe(0);

        // 4. Atomic Rollback: Buyer 2 has no orphaned OrderGroup or SubOrders
        expect(OrderGroup::where('user_id', $buyer2->id)->count())->toBe(0)
            ->and(SubOrder::where('user_id', $buyer2->id)->count())->toBe(0)
            ->and(SubOrderItem::where('product_sku_id', $limitedSku->id)->count())->toBe(1); // only Buyer 1's item

        // 5. Buyer 2's cart item remains untouched due to atomic transaction rollback
        expect(Cart::where('user_id', $buyer2->id)->where('selected', true)->count())->toBe(1);
    });

    it('rolls back completely if one store in a multi-store checkout has insufficient stock', function () {
        $buyer = User::factory()->create();
        $address = createBuyerAddress($buyer);

        // Store A has abundant stock (10)
        $itemA = createStoreSkuAndCart($buyer, stock: 10, quantity: 2);
        // Store B has insufficient stock (only 1 available, but cart requests 3)
        $itemB = createStoreSkuAndCart($buyer, stock: 1, quantity: 3);

        $payload = [
            'address_id' => $address->id,
            'stores' => [
                ['store_id' => $itemA['store']->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
                ['store_id' => $itemB['store']->id, 'courier_name' => 'sicepat', 'courier_service' => 'SIUNT'],
            ],
        ];

        /** @var ProcessMultiStoreCheckoutAction $action */
        $action = app(ProcessMultiStoreCheckoutAction::class);

        expect(fn () => $action->execute($buyer, $payload))
            ->toThrow(InsufficientStockException::class);

        // Complete atomic rollback: Store A's stock was not consumed
        expect($itemA['sku']->fresh()->stock)->toBe(10)
            ->and($itemB['sku']->fresh()->stock)->toBe(1);

        // No orders created for either store
        expect(OrderGroup::where('user_id', $buyer->id)->count())->toBe(0)
            ->and(SubOrder::where('user_id', $buyer->id)->count())->toBe(0);

        // All cart items preserved
        expect(Cart::where('user_id', $buyer->id)->count())->toBe(2);
    });
});

// ---------------------------------------------------------------------------
// 3. Anti-IDOR Address Defense (SEC-03)
// ---------------------------------------------------------------------------

describe('3. Anti-IDOR Address Defense (SEC-03)', function () {

    it('rejects checkout with 422 Unprocessable Entity when user supplies an address_id owned by another user', function () {
        $legitimateUser = User::factory()->create();
        $victimUser = User::factory()->create();

        // Address belongs to victim user
        $victimAddress = createBuyerAddress($victimUser, [
            'receiver' => 'Victim Recipient',
            'full_address' => 'Jl. Rahasia Korban No. 99, Bandung',
        ]);

        // Legitimate user sets up a valid cart
        $store = createStoreSkuAndCart($legitimateUser, stock: 10, quantity: 1);

        // Attacker submits victim's address_id
        $maliciousPayload = [
            'address_id' => $victimAddress->id,
            'stores' => [
                ['store_id' => $store['store']->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
            ],
        ];

        $response = $this->actingAs($legitimateUser)
            ->post(route('checkout.processMulti'), $maliciousPayload);

        // Must fail with validation error on address_id (HTTP 302 redirect with errors in session)
        $response->assertSessionHasErrors(['address_id']);

        // Zero OrderGroup or SubOrder created
        expect(OrderGroup::where('user_id', $legitimateUser->id)->count())->toBe(0)
            ->and(SubOrder::where('user_id', $legitimateUser->id)->count())->toBe(0);

        // Stock remains untouched
        expect($store['sku']->fresh()->stock)->toBe(10);

        // Cart items remain untouched
        expect(Cart::where('user_id', $legitimateUser->id)->count())->toBe(1);
    });

    it('rejects checkout with 422 when address_id does not exist at all', function () {
        $buyer = User::factory()->create();
        $store = createStoreSkuAndCart($buyer, stock: 5, quantity: 1);

        $nonExistentAddressId = 99999999;

        $response = $this->actingAs($buyer)->post(route('checkout.processMulti'), [
            'address_id' => $nonExistentAddressId,
            'stores' => [
                ['store_id' => $store['store']->id, 'courier_name' => 'jne', 'courier_service' => 'REG'],
            ],
        ]);

        $response->assertSessionHasErrors(['address_id']);
        expect(OrderGroup::where('user_id', $buyer->id)->count())->toBe(0);
    });
});
