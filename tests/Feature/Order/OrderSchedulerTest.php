<?php

use App\Models\Address;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\StoreWallet;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use App\Models\User;

/**
 * Fixture builder for scheduler test orders.
 *
 * @return array{
 *   buyer: User,
 *   seller: User,
 *   store: Store,
 *   sku: ProductSku,
 *   orderGroup: OrderGroup,
 *   subOrder: SubOrder,
 *   item: SubOrderItem
 * }
 */
function createSchedulerOrderFixture(
    string $orderGroupStatus = 'pending',
    string $subOrderStatus = 'waiting_payment',
    int $skuStock = 10,
    int $itemQuantity = 2,
    float $itemPrice = 50000.00,
): array {
    $buyer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $buyer->id]);

    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);

    $product = Product::factory()->create(['store_id' => $store->id]);
    $sku = ProductSku::factory()->create([
        'product_id' => $product->id,
        'stock' => $skuStock,
        'price' => $itemPrice,
        'combination_key' => 'Scheduler-SKU-'.strtoupper(bin2hex(random_bytes(2))),
    ]);

    $itemsSubtotal = $itemPrice * $itemQuantity;
    $shippingCost = 10000.00;

    $orderGroup = OrderGroup::create([
        'user_id' => $buyer->id,
        'group_code' => 'OG-SCHED-'.strtoupper(bin2hex(random_bytes(4))),
        'total_amount' => $itemsSubtotal + $shippingCost + 1000,
        'payment_status' => $orderGroupStatus,
    ]);

    $subOrder = SubOrder::create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'sub_order_number' => 'SUB-SCHED-'.strtoupper(bin2hex(random_bytes(4))),
        'courier_name' => 'jne',
        'courier_service' => 'REG',
        'items_subtotal' => $itemsSubtotal,
        'shipping_cost' => $shippingCost,
        'total_amount' => $itemsSubtotal + $shippingCost,
        'status' => $subOrderStatus,
    ]);

    $item = SubOrderItem::create([
        'sub_order_id' => $subOrder->id,
        'product_id' => $product->id,
        'product_sku_id' => $sku->id,
        'product_title' => $product->title,
        'sku_combination' => 'Scheduler-SKU',
        'price' => $itemPrice,
        'quantity' => $itemQuantity,
        'total_price' => $itemsSubtotal,
        'weight_gram' => 500,
    ]);

    return compact('buyer', 'seller', 'store', 'sku', 'orderGroup', 'subOrder', 'item');
}

test('orders:auto-cancel-unpaid cancels expired pending orders older than 24h and restores sku stock', function () {
    // 1. Expired order (25 hours ago)
    $fixtureExpired = createSchedulerOrderFixture(
        orderGroupStatus: 'pending',
        subOrderStatus: 'waiting_payment',
        skuStock: 10,
        itemQuantity: 3
    );
    $orderGroupExpired = $fixtureExpired['orderGroup'];
    $subOrderExpired = $fixtureExpired['subOrder'];
    $skuExpired = $fixtureExpired['sku'];

    // Force created_at to 25 hours ago
    $orderGroupExpired->created_at = now()->subHours(25);
    $orderGroupExpired->save();

    // 2. Fresh order (2 hours ago)
    $fixtureFresh = createSchedulerOrderFixture(
        orderGroupStatus: 'pending',
        subOrderStatus: 'waiting_payment',
        skuStock: 15,
        itemQuantity: 2
    );
    $orderGroupFresh = $fixtureFresh['orderGroup'];
    $subOrderFresh = $fixtureFresh['subOrder'];
    $skuFresh = $fixtureFresh['sku'];

    $orderGroupFresh->created_at = now()->subHours(2);
    $orderGroupFresh->save();

    // Execute console command
    $this->artisan('orders:auto-cancel-unpaid')
        ->expectsOutput('Berhasil membatalkan 1 pesanan belum dibayar.')
        ->assertSuccessful();

    // Verify expired order was cancelled and restocked: 10 + 3 = 13
    expect($orderGroupExpired->fresh()->payment_status)->toBe('expired')
        ->and($subOrderExpired->fresh()->status)->toBe('cancelled')
        ->and($skuExpired->fresh()->stock)->toBe(13);

    // Verify fresh order was NOT touched
    expect($orderGroupFresh->fresh()->payment_status)->toBe('pending')
        ->and($subOrderFresh->fresh()->status)->toBe('waiting_payment')
        ->and($skuFresh->fresh()->stock)->toBe(15);
});

test('orders:auto-cancel-unprocessed cancels paid orders untouched by seller for more than 48h', function () {
    // 1. Unprocessed order older than 48h
    $fixtureOld = createSchedulerOrderFixture(
        orderGroupStatus: 'paid',
        subOrderStatus: 'paid',
        skuStock: 8,
        itemQuantity: 2
    );
    $subOrderOld = $fixtureOld['subOrder'];
    $skuOld = $fixtureOld['sku'];

    // Force timestamps to 50 hours ago
    $subOrderOld->timestamps = false;
    $subOrderOld->updated_at = now()->subHours(50);
    $subOrderOld->created_at = now()->subHours(50);
    $subOrderOld->save();

    // 2. Fresh paid order (5 hours ago)
    $fixtureFresh = createSchedulerOrderFixture(
        orderGroupStatus: 'paid',
        subOrderStatus: 'paid',
        skuStock: 20,
        itemQuantity: 1
    );
    $subOrderFresh = $fixtureFresh['subOrder'];
    $skuFresh = $fixtureFresh['sku'];

    $subOrderFresh->timestamps = false;
    $subOrderFresh->updated_at = now()->subHours(5);
    $subOrderFresh->save();

    $this->artisan('orders:auto-cancel-unprocessed')
        ->expectsOutput('Berhasil membatalkan 1 pesanan lunas yang tidak diproses penjual.')
        ->assertSuccessful();

    // Old order must be cancelled and SKU restocked: 8 + 2 = 10
    expect($subOrderOld->fresh()->status)->toBe('cancelled')
        ->and($skuOld->fresh()->stock)->toBe(10);

    // Fresh order remains paid
    expect($subOrderFresh->fresh()->status)->toBe('paid')
        ->and($skuFresh->fresh()->stock)->toBe(20);
});

test('orders:auto-complete-delivered automatically completes orders delivered > 48h ago and releases escrow', function () {
    // 1. Delivered order 50 hours ago
    $fixtureDelivered = createSchedulerOrderFixture(
        orderGroupStatus: 'paid',
        subOrderStatus: 'delivered',
        itemQuantity: 2,
        itemPrice: 100000.00
    );
    $subOrderDelivered = $fixtureDelivered['subOrder'];
    $store = $fixtureDelivered['store'];

    $subOrderDelivered->delivered_at = now()->subHours(50);
    $subOrderDelivered->save();

    // 2. Recently delivered order (6 hours ago)
    $fixtureRecent = createSchedulerOrderFixture(
        orderGroupStatus: 'paid',
        subOrderStatus: 'delivered',
        itemQuantity: 1,
        itemPrice: 50000.00
    );
    $subOrderRecent = $fixtureRecent['subOrder'];

    $subOrderRecent->delivered_at = now()->subHours(6);
    $subOrderRecent->save();

    $this->artisan('orders:auto-complete-delivered')
        ->expectsOutput('Berhasil menyelesaikan 1 pesanan terkirim dan mencairkan escrow.')
        ->assertSuccessful();

    // 1. Delivered order must be completed with completed_at set
    $freshDelivered = $subOrderDelivered->fresh();
    expect($freshDelivered->status)->toBe('completed')
        ->and($freshDelivered->completed_at)->not->toBeNull();

    // Seller wallet must have received escrow: 2 * 100,000 = 200,000.00
    $wallet = StoreWallet::where('store_id', $store->id)->first();
    expect($wallet)->not->toBeNull()
        ->and((float) $wallet->balance)->toBe(200000.00);

    // 2. Recent delivered order remains delivered
    expect($subOrderRecent->fresh()->status)->toBe('delivered');
});
