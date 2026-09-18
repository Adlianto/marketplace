<?php

use App\Actions\Order\CompleteSubOrderAction;
use App\Exceptions\InvalidOrderStateTransitionException;
use App\Models\Address;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\StoreWallet;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use App\Models\User;
use App\Models\WalletTransaction;

/**
 * Helper to build an order fixture for buyer order completion tests.
 *
 * @return array{
 *   buyer: User,
 *   seller: User,
 *   store: Store,
 *   subOrder: SubOrder
 * }
 */
function createBuyerOrderFixture(string $status = 'shipped', float $subtotal = 250000.00, float $shippingCost = 15000.00): array
{
    $buyer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $buyer->id]);

    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);

    $product = Product::factory()->create(['store_id' => $store->id]);
    $sku = ProductSku::factory()->create([
        'product_id' => $product->id,
        'stock' => 10,
        'price' => $subtotal,
        'combination_key' => 'Default-Variant',
    ]);

    $orderGroup = OrderGroup::create([
        'user_id' => $buyer->id,
        'group_code' => 'OG-BUYER-'.strtoupper(bin2hex(random_bytes(4))),
        'total_amount' => $subtotal + $shippingCost + 1000,
        'payment_status' => 'paid',
    ]);

    $subOrder = SubOrder::create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'sub_order_number' => 'SUB-BUYER-'.strtoupper(bin2hex(random_bytes(4))),
        'courier_name' => 'jne',
        'courier_service' => 'REG',
        'tracking_number' => 'JNE-RESITEST-001',
        'items_subtotal' => $subtotal,
        'shipping_cost' => $shippingCost,
        'total_amount' => $subtotal + $shippingCost,
        'status' => $status,
        'shipped_at' => now()->subDay(),
    ]);

    SubOrderItem::create([
        'sub_order_id' => $subOrder->id,
        'product_id' => $product->id,
        'product_sku_id' => $sku->id,
        'product_title' => $product->title,
        'sku_combination' => 'Default-Variant',
        'price' => $subtotal,
        'quantity' => 1,
        'total_price' => $subtotal,
        'weight_gram' => 500,
    ]);

    return compact('buyer', 'seller', 'store', 'subOrder');
}

test('legitimate buyer can complete shipped sub order and triggers escrow release to seller wallet', function () {
    $fixture = createBuyerOrderFixture('shipped', 350000.00);
    $buyer = $fixture['buyer'];
    $store = $fixture['store'];
    $subOrder = $fixture['subOrder'];

    $response = $this->actingAs($buyer)
        ->post(route('orders.complete', $subOrder));

    $response->assertRedirect()
        ->assertSessionHas('success');

    $freshOrder = $subOrder->fresh();
    expect($freshOrder->status)->toBe('completed')
        ->and($freshOrder->completed_at)->not->toBeNull();

    // Seller wallet must be credited accurately with items_subtotal
    $wallet = StoreWallet::where('store_id', $store->id)->first();
    expect($wallet)->not->toBeNull()
        ->and((float) $wallet->balance)->toBe(350000.00);

    // Credit transaction record must exist
    $tx = WalletTransaction::where('sub_order_id', $subOrder->id)->first();
    expect($tx)->not->toBeNull()
        ->and($tx->type)->toBe('credit')
        ->and((float) $tx->amount)->toBe(350000.00)
        ->and($tx->store_wallet_id)->toBe($wallet->id)
        ->and($tx->description)->toContain($subOrder->sub_order_number);
});

test('legitimate buyer can complete delivered sub order', function () {
    $fixture = createBuyerOrderFixture('delivered', 180000.00);
    $buyer = $fixture['buyer'];
    $store = $fixture['store'];
    $subOrder = $fixture['subOrder'];

    $response = $this->actingAs($buyer)
        ->post(route('orders.complete', $subOrder));

    $response->assertRedirect()
        ->assertSessionHas('success');

    expect($subOrder->fresh()->status)->toBe('completed')
        ->and($subOrder->fresh()->completed_at)->not->toBeNull();

    $wallet = StoreWallet::where('store_id', $store->id)->first();
    expect((float) $wallet->balance)->toBe(180000.00);
});

test('anti idor defense rejects attempt by another user to complete someone elses order with 403', function () {
    $fixture = createBuyerOrderFixture('shipped', 200000.00);
    $subOrder = $fixture['subOrder'];
    $store = $fixture['store'];

    // Another buyer attempting IDOR attack
    $otherBuyer = User::factory()->create();

    $response = $this->actingAs($otherBuyer)
        ->post(route('orders.complete', $subOrder));

    $response->assertStatus(403);

    // Status remains shipped and no escrow is released
    expect($subOrder->fresh()->status)->toBe('shipped');

    $wallet = StoreWallet::where('store_id', $store->id)->first();
    if ($wallet) {
        expect((float) $wallet->balance)->toBe(0.00);
    }
    expect(WalletTransaction::where('sub_order_id', $subOrder->id)->count())->toBe(0);
});

test('completing order that is still waiting_payment or processing is rejected', function (string $invalidStatus) {
    $fixture = createBuyerOrderFixture($invalidStatus, 150000.00);
    $buyer = $fixture['buyer'];
    $subOrder = $fixture['subOrder'];
    $store = $fixture['store'];

    $action = app(CompleteSubOrderAction::class);

    expect(fn () => $action->execute($buyer, $subOrder))
        ->toThrow(InvalidOrderStateTransitionException::class);

    expect($subOrder->fresh()->status)->toBe($invalidStatus);

    $wallet = StoreWallet::where('store_id', $store->id)->first();
    if ($wallet) {
        expect((float) $wallet->balance)->toBe(0.00);
    }
})->with(['waiting_payment', 'paid', 'processing']);

test('completing an already completed order is rejected due to terminal state', function () {
    $fixture = createBuyerOrderFixture('completed', 100000.00);
    $buyer = $fixture['buyer'];
    $subOrder = $fixture['subOrder'];

    $action = app(CompleteSubOrderAction::class);

    expect(fn () => $action->execute($buyer, $subOrder))
        ->toThrow(InvalidOrderStateTransitionException::class);
});
