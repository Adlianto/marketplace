<?php

use App\Models\Address;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use App\Models\User;

/**
 * Helper to generate an isolated SubOrder with related models.
 */
function createSellerOrderFixture(Store $store, string $status = 'paid'): SubOrder
{
    $buyer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $buyer->id]);

    $product = Product::factory()->create(['store_id' => $store->id]);
    $sku = ProductSku::factory()->create([
        'product_id' => $product->id,
        'stock' => 10,
        'price' => 75000,
        'combination_key' => 'Default-Opt',
    ]);

    $orderGroup = OrderGroup::create([
        'user_id' => $buyer->id,
        'group_code' => 'OG-'.strtoupper(bin2hex(random_bytes(4))),
        'total_amount' => 85000,
        'payment_status' => 'paid',
    ]);

    $subOrder = SubOrder::create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'sub_order_number' => 'SUB-ORD-'.strtoupper(bin2hex(random_bytes(4))),
        'courier_name' => 'jne',
        'courier_service' => 'REG',
        'items_subtotal' => 75000,
        'shipping_cost' => 10000,
        'total_amount' => 85000,
        'status' => $status,
    ]);

    SubOrderItem::create([
        'sub_order_id' => $subOrder->id,
        'product_id' => $product->id,
        'product_sku_id' => $sku->id,
        'product_title' => $product->title,
        'sku_combination' => 'Default-Opt',
        'price' => 75000,
        'quantity' => 1,
        'total_price' => 75000,
        'weight_gram' => 500,
    ]);

    return $subOrder;
}

test('seller can view their store orders list with status counters', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);

    $orderPaid = createSellerOrderFixture($store, 'paid');
    $orderProcessing = createSellerOrderFixture($store, 'processing');

    // Another store's order
    $otherSeller = User::factory()->create();
    $otherStore = Store::factory()->create(['user_id' => $otherSeller->id]);
    $otherOrder = createSellerOrderFixture($otherStore, 'paid');

    $response = $this->actingAs($seller)->get(route('seller.orders.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('seller/orders/index')
            ->has('orders.data', 2)
            ->where('counts.paid', 1)
            ->where('counts.processing', 1)
            ->where('counts.all', 2)
        );
});

test('seller can filter orders by status', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);

    createSellerOrderFixture($store, 'paid');
    createSellerOrderFixture($store, 'processing');
    createSellerOrderFixture($store, 'shipped');

    $response = $this->actingAs($seller)->get(route('seller.orders.index', ['status' => 'processing']));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('seller/orders/index')
            ->has('orders.data', 1)
            ->where('orders.data.0.status', 'processing')
        );
});

test('legitimate seller can accept paid sub order and transition to processing', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);
    $subOrder = createSellerOrderFixture($store, 'paid');

    $response = $this->actingAs($seller)
        ->post(route('seller.orders.accept', $subOrder));

    $response->assertRedirect()
        ->assertSessionHas('success');

    expect($subOrder->fresh()->status)->toBe('processing');
});

test('legitimate seller can fulfill order with valid tracking number and transition to shipped', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);
    $subOrder = createSellerOrderFixture($store, 'processing');

    $response = $this->actingAs($seller)
        ->post(route('seller.orders.ship', $subOrder), [
            'tracking_number' => 'JNE-1234567890-ID',
        ]);

    $response->assertRedirect()
        ->assertSessionHas('success');

    $freshOrder = $subOrder->fresh();
    expect($freshOrder->status)->toBe('shipped')
        ->and($freshOrder->tracking_number)->toBe('JNE-1234567890-ID')
        ->and($freshOrder->shipped_at)->not->toBeNull();
});

test('anti idor defense rejects attempt by another seller to accept or ship order with 403', function () {
    // Store A owned by Seller A
    $sellerA = User::factory()->create();
    $storeA = Store::factory()->create(['user_id' => $sellerA->id]);
    $subOrder = createSellerOrderFixture($storeA, 'paid');

    // Seller B trying to tamper Store A's order
    $sellerB = User::factory()->create();
    $storeB = Store::factory()->create(['user_id' => $sellerB->id]);

    // 1. Seller B attempts to accept Seller A's order
    $acceptResponse = $this->actingAs($sellerB)
        ->post(route('seller.orders.accept', $subOrder));

    $acceptResponse->assertStatus(403);
    expect($subOrder->fresh()->status)->toBe('paid');

    // 2. Transition legitimately to processing, then test ship tampering
    $subOrder->update(['status' => 'processing']);

    $shipResponse = $this->actingAs($sellerB)
        ->post(route('seller.orders.ship', $subOrder), [
            'tracking_number' => 'HACKED-RESI-999',
        ]);

    $shipResponse->assertStatus(403);
    expect($subOrder->fresh()->status)->toBe('processing')
        ->and($subOrder->fresh()->tracking_number)->toBeNull();
});

test('tracking number input is strictly validated against invalid characters and length', function (string $invalidTracking) {
    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);
    $subOrder = createSellerOrderFixture($store, 'processing');

    $response = $this->actingAs($seller)
        ->post(route('seller.orders.ship', $subOrder), [
            'tracking_number' => $invalidTracking,
        ]);

    $response->assertSessionHasErrors('tracking_number');
    expect($subOrder->fresh()->status)->toBe('processing')
        ->and($subOrder->fresh()->tracking_number)->toBeNull();
})->with([
    '',                 // empty
    '123',              // too short (< 5)
    'JNE@12345',        // illegal character '@'
    'RESI#99999!',      // illegal characters '#' and '!'
    'RESI DENGAN SPASI', // space not allowed
    str_repeat('A', 51), // too long (> 50)
]);
