<?php

use App\Actions\Payment\CreateMidtransSnapTokenAction;
use App\Models\Address;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use App\Models\User;

beforeEach(function () {
    CreateMidtransSnapTokenAction::tearDownFake();
});

afterEach(function () {
    CreateMidtransSnapTokenAction::tearDownFake();
});

/**
 * Helper to setup an OrderGroup with 2 stores, items, and shipping costs.
 *
 * @return array{
 *   buyer: User,
 *   address: Address,
 *   orderGroup: OrderGroup,
 *   subOrderA: SubOrder,
 *   subOrderB: SubOrder
 * }
 */
function createOrderGroupFixture(): array
{
    $buyer = User::factory()->create([
        'name' => 'Budi Santoso',
        'email' => 'budi.santoso@example.com',
        'phone' => '081234567890',
    ]);

    $address = Address::factory()->create([
        'user_id' => $buyer->id,
        'phone' => '089876543210',
    ]);

    // Store A
    $sellerA = User::factory()->create();
    $storeA = Store::factory()->create([
        'user_id' => $sellerA->id,
        'name' => 'Official Store Jakarta',
    ]);
    $productA = Product::factory()->create(['store_id' => $storeA->id]);
    $skuA1 = ProductSku::factory()->create([
        'product_id' => $productA->id,
        'price' => 100000,
        'combination_key' => 'Merah-L',
    ]);
    $skuA2 = ProductSku::factory()->create([
        'product_id' => $productA->id,
        'price' => 50000,
        'combination_key' => 'Biru-M',
    ]);

    // Store B
    $sellerB = User::factory()->create();
    $storeB = Store::factory()->create([
        'user_id' => $sellerB->id,
        'name' => 'Bandung Gadget Center',
    ]);
    $productB = Product::factory()->create(['store_id' => $storeB->id]);
    $skuB1 = ProductSku::factory()->create([
        'product_id' => $productB->id,
        'price' => 250000,
        'combination_key' => 'Hitam-Default',
    ]);

    // Financial breakdown:
    // Store A: Item1 (100k x 2 = 200k) + Item2 (50k x 1 = 50k) = 250k. Ongkir = 8.000. Subtotal = 258.000
    // Store B: Item1 (250k x 1 = 250k) = 250k. Ongkir = 15.000. Subtotal = 265.000
    // Grand Total = 258.000 + 265.000 = 523.000
    $grandTotal = 523000;

    $orderGroup = OrderGroup::factory()->create([
        'user_id' => $buyer->id,
        'group_code' => 'OG-20260918-TEST01',
        'total_amount' => $grandTotal,
        'payment_status' => 'pending',
        'snap_token' => null,
    ]);

    $subOrderA = SubOrder::factory()->create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $storeA->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'items_subtotal' => 250000,
        'shipping_cost' => 8000,
        'total_amount' => 258000,
    ]);

    SubOrderItem::factory()->create([
        'sub_order_id' => $subOrderA->id,
        'product_id' => $productA->id,
        'product_sku_id' => $skuA1->id,
        'product_title' => 'Kemeja Katun Pria',
        'sku_combination' => 'Merah-L',
        'price' => 100000,
        'quantity' => 2,
        'total_price' => 200000,
    ]);

    SubOrderItem::factory()->create([
        'sub_order_id' => $subOrderA->id,
        'product_id' => $productA->id,
        'product_sku_id' => $skuA2->id,
        'product_title' => 'Kaos Polos Premium',
        'sku_combination' => 'Biru-M',
        'price' => 50000,
        'quantity' => 1,
        'total_price' => 50000,
    ]);

    $subOrderB = SubOrder::factory()->create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $storeB->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'items_subtotal' => 250000,
        'shipping_cost' => 15000,
        'total_amount' => 265000,
    ]);

    SubOrderItem::factory()->create([
        'sub_order_id' => $subOrderB->id,
        'product_id' => $productB->id,
        'product_sku_id' => $skuB1->id,
        'product_title' => 'Wireless Gaming Headset',
        'sku_combination' => null,
        'price' => 250000,
        'quantity' => 1,
        'total_price' => 250000,
    ]);

    return compact('buyer', 'address', 'orderGroup', 'subOrderA', 'subOrderB');
}

describe('CreateMidtransSnapTokenAction', function () {

    it('builds a structured Midtrans Snap payload with valid transaction and customer details', function () {
        $fixture = createOrderGroupFixture();
        $action = new CreateMidtransSnapTokenAction;

        $payload = $action->buildPayload($fixture['orderGroup']);

        // 1. Transaction details
        expect($payload['transaction_details'])->toBe([
            'order_id' => 'OG-20260918-TEST01',
            'gross_amount' => 523000,
        ]);

        // 2. Customer details
        expect($payload['customer_details'])->toBe([
            'first_name' => 'Budi Santoso',
            'email' => 'budi.santoso@example.com',
            'phone' => '089876543210',
        ]);
    });

    it('aggregates all SKU items and shipping cost lines into item_details', function () {
        $fixture = createOrderGroupFixture();
        $action = new CreateMidtransSnapTokenAction;

        $payload = $action->buildPayload($fixture['orderGroup']);
        $itemDetails = $payload['item_details'];

        // Should have 3 SKU items + 2 shipping cost lines = 5 lines total
        expect($itemDetails)->toHaveCount(5);

        // Check SKU items presence
        $itemIds = array_column($itemDetails, 'id');
        expect($itemIds)->toContain(
            "ITEM-{$fixture['subOrderA']->items[0]->id}",
            "ITEM-{$fixture['subOrderA']->items[1]->id}",
            "ITEM-{$fixture['subOrderB']->items[0]->id}"
        );

        // Check Shipping lines presence
        expect($itemIds)->toContain(
            "SHIPPING-{$fixture['subOrderA']->id}",
            "SHIPPING-{$fixture['subOrderB']->id}"
        );

        // Check shipping names contain store names
        $shippingA = collect($itemDetails)->firstWhere('id', "SHIPPING-{$fixture['subOrderA']->id}");
        expect($shippingA['name'])->toBe('Ongkir - Official Store Jakarta')
            ->and($shippingA['price'])->toBe(8000)
            ->and($shippingA['quantity'])->toBe(1);

        $shippingB = collect($itemDetails)->firstWhere('id', "SHIPPING-{$fixture['subOrderB']->id}");
        expect($shippingB['name'])->toBe('Ongkir - Bandung Gadget Center')
            ->and($shippingB['price'])->toBe(15000)
            ->and($shippingB['quantity'])->toBe(1);
    });

    it('ensures the sum of item_details matches gross_amount exactly', function () {
        $fixture = createOrderGroupFixture();
        $action = new CreateMidtransSnapTokenAction;

        $payload = $action->buildPayload($fixture['orderGroup']);

        $sum = array_sum(array_map(
            fn (array $item) => $item['price'] * $item['quantity'],
            $payload['item_details']
        ));

        expect($sum)->toBe($payload['transaction_details']['gross_amount'])
            ->and($sum)->toBe(523000);
    });

    it('truncates long item and shipping names to a maximum of 50 characters', function () {
        $buyer = User::factory()->create();
        $store = Store::factory()->create([
            'name' => 'Toko Elektronik Super Lengkap Sangat Terpercaya No 1 Di Indonesia',
        ]);
        $orderGroup = OrderGroup::factory()->create([
            'user_id' => $buyer->id,
            'total_amount' => 110000,
        ]);
        $subOrder = SubOrder::factory()->create([
            'order_group_id' => $orderGroup->id,
            'store_id' => $store->id,
            'shipping_cost' => 10000,
            'items_subtotal' => 100000,
            'total_amount' => 110000,
        ]);

        SubOrderItem::factory()->create([
            'sub_order_id' => $subOrder->id,
            'product_title' => 'Smartphone Flagship Generasi Terbaru Dengan Layar Amoled 120Hz Snapdragon 8 Gen 3',
            'sku_combination' => 'Titanium Grey 512GB RAM 16GB',
            'price' => 100000,
            'quantity' => 1,
            'total_price' => 100000,
        ]);

        $action = new CreateMidtransSnapTokenAction;
        $payload = $action->buildPayload($orderGroup);

        foreach ($payload['item_details'] as $item) {
            expect(mb_strlen($item['name']))->toBeLessThanOrEqual(50);
        }
    });

    it('adds a platform service fee line item if gross_amount exceeds items sum', function () {
        $buyer = User::factory()->create();
        $store = Store::factory()->create();
        // Product 50k, Shipping 10k, but grand total is 61k (1k platform fee)
        $orderGroup = OrderGroup::factory()->create([
            'user_id' => $buyer->id,
            'total_amount' => 61000,
        ]);
        $subOrder = SubOrder::factory()->create([
            'order_group_id' => $orderGroup->id,
            'store_id' => $store->id,
            'shipping_cost' => 10000,
            'items_subtotal' => 50000,
            'total_amount' => 60000,
        ]);

        SubOrderItem::factory()->create([
            'sub_order_id' => $subOrder->id,
            'product_title' => 'Produk A',
            'price' => 50000,
            'quantity' => 1,
            'total_price' => 50000,
        ]);

        $action = new CreateMidtransSnapTokenAction;
        $payload = $action->buildPayload($orderGroup);

        $feeItem = collect($payload['item_details'])->firstWhere('id', 'SERVICE-FEE');
        expect($feeItem)->not->toBeNull()
            ->and($feeItem['price'])->toBe(1000)
            ->and($feeItem['name'])->toBe('Biaya Jasa Aplikasi');

        $sum = array_sum(array_map(fn ($i) => $i['price'] * $i['quantity'], $payload['item_details']));
        expect($sum)->toBe(61000);
    });

    it('executes action, persists snap_token in OrderGroup record, and returns the token', function () {
        $fixture = createOrderGroupFixture();
        $expectedToken = 'snap-token-f4k3-1234567890abcdef';

        CreateMidtransSnapTokenAction::fake(fn () => $expectedToken);

        $action = new CreateMidtransSnapTokenAction;
        $returnedToken = $action->execute($fixture['orderGroup']);

        // 1. Returns token
        expect($returnedToken)->toBe($expectedToken);

        // 2. Persisted to database
        expect($fixture['orderGroup']->fresh()->snap_token)->toBe($expectedToken);

        // 3. Captured payload is valid
        $captured = CreateMidtransSnapTokenAction::capturedPayloads();
        expect($captured)->toHaveCount(1)
            ->and($captured[0]['transaction_details']['order_id'])->toBe($fixture['orderGroup']->group_code);
    });
});
