<?php

use App\Models\Address;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use App\Models\User;

test('order group, sub orders, and sub order items have proper relations and cascade delete', function () {
    $buyer = User::factory()->create();
    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);
    $address = Address::factory()->create(['user_id' => $buyer->id]);

    $product = Product::factory()->create([
        'store_id' => $store->id,
        'title' => 'Tas Ransel Outdoor Pro',
        'has_variants' => true,
    ]);

    $sku = ProductSku::factory()->create([
        'product_id' => $product->id,
        'sku_code' => 'TAS-BLK-L',
        'combination_key' => 'Hitam-L',
        'price' => 350000,
        'stock' => 10,
        'weight_gram' => 600,
    ]);

    // Create OrderGroup
    $orderGroup = OrderGroup::factory()->create([
        'user_id' => $buyer->id,
        'group_code' => 'TRX-20260918-99988',
        'total_amount' => 370000,
        'payment_status' => 'pending',
    ]);

    // Create SubOrder
    $subOrder = SubOrder::factory()->create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'sub_order_number' => 'INV-STORE1-20260918-001',
        'courier_name' => 'JNE',
        'courier_service' => 'REG',
        'items_subtotal' => 350000,
        'shipping_cost' => 20000,
        'total_amount' => 370000,
        'status' => 'waiting_payment',
    ]);

    // Create SubOrderItem
    $subOrderItem = SubOrderItem::factory()->create([
        'sub_order_id' => $subOrder->id,
        'product_id' => $product->id,
        'product_sku_id' => $sku->id,
        'product_title' => $product->title,
        'sku_combination' => $sku->combination_key,
        'price' => 350000,
        'quantity' => 1,
        'total_price' => 350000,
        'weight_gram' => 600,
    ]);

    // Verify relations
    expect($orderGroup->subOrders)->toHaveCount(1)
        ->and($orderGroup->user->id)->toBe($buyer->id)
        ->and($subOrder->orderGroup->id)->toBe($orderGroup->id)
        ->and($subOrder->store->id)->toBe($store->id)
        ->and($subOrder->user->id)->toBe($buyer->id)
        ->and($subOrder->address->id)->toBe($address->id)
        ->and($subOrder->items)->toHaveCount(1)
        ->and($subOrderItem->subOrder->id)->toBe($subOrder->id)
        ->and($subOrderItem->product->id)->toBe($product->id)
        ->and($subOrderItem->productSku?->id)->toBe($sku->id)
        ->and($subOrderItem->sku?->id)->toBe($sku->id);

    // Verify User and Store reverse relations
    expect($buyer->orderGroups)->toHaveCount(1)
        ->and($buyer->subOrders)->toHaveCount(1)
        ->and($store->subOrders)->toHaveCount(1);

    // Verify cascading deletion: deleting OrderGroup should delete SubOrder and SubOrderItem
    $orderGroup->delete();

    $this->assertDatabaseMissing('order_groups', ['id' => $orderGroup->id]);
    $this->assertDatabaseMissing('sub_orders', ['id' => $subOrder->id]);
    $this->assertDatabaseMissing('sub_order_items', ['id' => $subOrderItem->id]);
});
