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
 * Generate cryptographic SHA-512 signature for Midtrans webhook testing.
 */
function makeMidtransSignature(string $orderId, string $statusCode, string $grossAmount): string
{
    $serverKey = (string) config('midtrans.server_key');

    return hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);
}

/**
 * Fixture helper to create an OrderGroup with 2 stores and multiple SKUs.
 *
 * @return array{
 *   buyer: User,
 *   orderGroup: OrderGroup,
 *   subOrderA: SubOrder,
 *   subOrderB: SubOrder,
 *   skuA: ProductSku,
 *   skuB: ProductSku
 * }
 */
function createWebhookOrderGroupFixture(int $stockA = 10, int $stockB = 15): array
{
    $buyer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $buyer->id]);

    // Store A
    $sellerA = User::factory()->create();
    $storeA = Store::factory()->create(['user_id' => $sellerA->id]);
    $productA = Product::factory()->create(['store_id' => $storeA->id]);
    $skuA = ProductSku::factory()->create([
        'product_id' => $productA->id,
        'stock' => $stockA,
        'price' => 100000,
        'combination_key' => 'Merah-L',
    ]);

    // Store B
    $sellerB = User::factory()->create();
    $storeB = Store::factory()->create(['user_id' => $sellerB->id]);
    $productB = Product::factory()->create(['store_id' => $storeB->id]);
    $skuB = ProductSku::factory()->create([
        'product_id' => $productB->id,
        'stock' => $stockB,
        'price' => 50000,
        'combination_key' => 'Biru-M',
    ]);

    $orderGroup = OrderGroup::factory()->create([
        'user_id' => $buyer->id,
        'group_code' => 'OG-'.fake()->numerify('##########'),
        'total_amount' => 315000, // 200k + 8k + 100k + 7k
        'payment_status' => 'pending',
    ]);

    $subOrderA = SubOrder::factory()->create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $storeA->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'items_subtotal' => 200000,
        'shipping_cost' => 8000,
        'total_amount' => 208000,
        'status' => 'waiting_payment',
    ]);

    SubOrderItem::factory()->create([
        'sub_order_id' => $subOrderA->id,
        'product_id' => $productA->id,
        'product_sku_id' => $skuA->id,
        'product_title' => $productA->title,
        'price' => 100000,
        'quantity' => 2,
        'total_price' => 200000,
    ]);

    $subOrderB = SubOrder::factory()->create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $storeB->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'items_subtotal' => 100000,
        'shipping_cost' => 7000,
        'total_amount' => 107000,
        'status' => 'waiting_payment',
    ]);

    SubOrderItem::factory()->create([
        'sub_order_id' => $subOrderB->id,
        'product_id' => $productB->id,
        'product_sku_id' => $skuB->id,
        'product_title' => $productB->title,
        'price' => 50000,
        'quantity' => 2,
        'total_price' => 100000,
    ]);

    return compact('buyer', 'orderGroup', 'subOrderA', 'subOrderB', 'skuA', 'skuB');
}

describe('MidtransWebhookController', function () {

    it('rejects webhook with invalid or spoofed signature key with HTTP 403 Forbidden', function () {
        $fixture = createWebhookOrderGroupFixture();
        $orderId = $fixture['orderGroup']->group_code;

        $payload = [
            'order_id' => $orderId,
            'status_code' => '200',
            'gross_amount' => '315000',
            'transaction_status' => 'settlement',
            'signature_key' => 'fake_spoofed_signature_hash_1234567890',
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);

        // OrderGroup and SubOrders must NOT be modified
        expect($fixture['orderGroup']->fresh()->payment_status)->toBe('pending');
        expect($fixture['subOrderA']->fresh()->status)->toBe('waiting_payment');
    });

    it('rejects webhook with missing signature parameters with HTTP 403', function () {
        $payload = [
            'order_id' => 'OG-NONEXISTENT',
            'transaction_status' => 'settlement',
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(403);
    });

    it('successfully processes valid settlement notification and marks OrderGroup and all SubOrders as paid', function () {
        $fixture = createWebhookOrderGroupFixture();
        $orderGroup = $fixture['orderGroup'];
        $orderId = $orderGroup->group_code;
        $statusCode = '200';
        $grossAmount = '315000';

        $signature = makeMidtransSignature($orderId, $statusCode, $grossAmount);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'signature_key' => $signature,
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        // OrderGroup updated to paid
        expect($orderGroup->fresh()->payment_status)->toBe('paid');

        // All SubOrders updated to paid
        expect($fixture['subOrderA']->fresh()->status)->toBe('paid')
            ->and($fixture['subOrderB']->fresh()->status)->toBe('paid');
    });

    it('handles capture with fraud_status accept as paid', function () {
        $fixture = createWebhookOrderGroupFixture();
        $orderGroup = $fixture['orderGroup'];
        $orderId = $orderGroup->group_code;
        $statusCode = '200';
        $grossAmount = '315000';

        $signature = makeMidtransSignature($orderId, $statusCode, $grossAmount);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'capture',
            'fraud_status' => 'accept',
            'signature_key' => $signature,
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(200);
        expect($orderGroup->fresh()->payment_status)->toBe('paid')
            ->and($fixture['subOrderA']->fresh()->status)->toBe('paid');
    });

    it('is idempotent: duplicate settlement notifications do not cause duplicate mutations', function () {
        $fixture = createWebhookOrderGroupFixture();
        $orderGroup = $fixture['orderGroup'];
        $orderId = $orderGroup->group_code;
        $statusCode = '200';
        $grossAmount = '315000';

        $signature = makeMidtransSignature($orderId, $statusCode, $grossAmount);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'signature_key' => $signature,
        ];

        // First notification
        $response1 = $this->postJson(route('api.midtrans.webhook'), $payload);
        $response1->assertStatus(200);
        expect($orderGroup->fresh()->payment_status)->toBe('paid');

        // Second identical notification (replay attack or network duplicate)
        $response2 = $this->postJson(route('api.midtrans.webhook'), $payload);
        $response2->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Notifikasi idempoten: Pesanan telah berstatus lunas.',
            ]);

        // State remains paid
        expect($orderGroup->fresh()->payment_status)->toBe('paid');
    });

    it('cancels OrderGroup and atomically restores SKU stock upon receiving expire or cancel notification', function () {
        // Initial stock: skuA = 8, skuB = 12 (since 2 items were checked out)
        $fixture = createWebhookOrderGroupFixture(stockA: 8, stockB: 12);
        $orderGroup = $fixture['orderGroup'];
        $orderId = $orderGroup->group_code;
        $statusCode = '202';
        $grossAmount = '315000';

        $signature = makeMidtransSignature($orderId, $statusCode, $grossAmount);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'expire',
            'signature_key' => $signature,
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        // OrderGroup and SubOrders marked as cancelled
        expect($orderGroup->fresh()->payment_status)->toBe('cancelled')
            ->and($fixture['subOrderA']->fresh()->status)->toBe('cancelled')
            ->and($fixture['subOrderB']->fresh()->status)->toBe('cancelled');

        // SKU Stock restored:
        // skuA: 8 + 2 = 10
        // skuB: 12 + 2 = 14
        expect($fixture['skuA']->fresh()->stock)->toBe(10)
            ->and($fixture['skuB']->fresh()->stock)->toBe(14);
    });

    it('is idempotent on cancel: duplicate expire notifications do not restore stock multiple times', function () {
        $fixture = createWebhookOrderGroupFixture(stockA: 5, stockB: 10);
        $orderGroup = $fixture['orderGroup'];
        $orderId = $orderGroup->group_code;
        $statusCode = '202';
        $grossAmount = '315000';

        $signature = makeMidtransSignature($orderId, $statusCode, $grossAmount);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'cancel',
            'signature_key' => $signature,
        ];

        // 1st cancel call: restocks 5 + 2 = 7 and 10 + 2 = 12
        $this->postJson(route('api.midtrans.webhook'), $payload)->assertStatus(200);
        expect($fixture['skuA']->fresh()->stock)->toBe(7)
            ->and($fixture['skuB']->fresh()->stock)->toBe(12);

        // 2nd duplicate cancel call: must NOT increment stock again
        $response2 = $this->postJson(route('api.midtrans.webhook'), $payload);
        $response2->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Notifikasi idempoten: Pesanan telah dibatalkan sebelumnya.',
            ]);

        expect($fixture['skuA']->fresh()->stock)->toBe(7)
            ->and($fixture['skuB']->fresh()->stock)->toBe(12);
    });

    it('returns 404 if OrderGroup does not exist in database', function () {
        $orderId = 'OG-UNKNOWN-999999';
        $statusCode = '200';
        $grossAmount = '100000';

        $signature = makeMidtransSignature($orderId, $statusCode, $grossAmount);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'settlement',
            'signature_key' => $signature,
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
            ]);
    });

    it('handles deny status by cancelling order and restoring SKU stock', function () {
        $fixture = createWebhookOrderGroupFixture(stockA: 10, stockB: 15);
        $orderGroup = $fixture['orderGroup'];
        $orderId = $orderGroup->group_code;
        $statusCode = '202';
        $grossAmount = '315000';

        $signature = makeMidtransSignature($orderId, $statusCode, $grossAmount);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'deny',
            'signature_key' => $signature,
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Pesanan dibatalkan dan stok SKU berhasil direstorasi.',
            ]);

        expect($orderGroup->fresh()->payment_status)->toBe('cancelled')
            ->and($fixture['subOrderA']->fresh()->status)->toBe('cancelled')
            ->and($fixture['subOrderB']->fresh()->status)->toBe('cancelled')
            ->and($fixture['skuA']->fresh()->stock)->toBe(12)
            ->and($fixture['skuB']->fresh()->stock)->toBe(17);
    });

    it('rejects payload where gross_amount has been tampered without matching signature', function () {
        $fixture = createWebhookOrderGroupFixture();
        $orderGroup = $fixture['orderGroup'];
        $orderId = $orderGroup->group_code;
        $originalAmount = '315000';
        $tamperedAmount = '1000'; // Attacker tampered gross amount
        $statusCode = '200';

        // Signature was computed with original amount
        $signature = makeMidtransSignature($orderId, $statusCode, $originalAmount);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $tamperedAmount,
            'transaction_status' => 'settlement',
            'signature_key' => $signature,
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(403);
        expect($orderGroup->fresh()->payment_status)->toBe('pending');
    });

    it('acknowledges pending notifications without modifying order status', function () {
        $fixture = createWebhookOrderGroupFixture();
        $orderGroup = $fixture['orderGroup'];
        $orderId = $orderGroup->group_code;
        $statusCode = '201';
        $grossAmount = '315000';

        $signature = makeMidtransSignature($orderId, $statusCode, $grossAmount);

        $payload = [
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'pending',
            'signature_key' => $signature,
        ];

        $response = $this->postJson(route('api.midtrans.webhook'), $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Notifikasi berstatus pending berhasil dicatat.',
            ]);

        expect($orderGroup->fresh()->payment_status)->toBe('pending')
            ->and($fixture['subOrderA']->fresh()->status)->toBe('waiting_payment');
    });
});
