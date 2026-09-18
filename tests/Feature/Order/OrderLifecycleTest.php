<?php

use App\Models\Address;
use App\Models\Cart;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\StoreWallet;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\Cart\CartGroupingService;

it('executes complete multi-seller marketplace transaction journey successfully', function () {
    // -------------------------------------------------------------------------
    // Step 1: Sellers & Products Setup
    // -------------------------------------------------------------------------
    // User A opens Toko A (Jakarta Pusat) and creates Kaos with 2 SKUs (Hitam-M, Hitam-L)
    $sellerA = User::factory()->create(['name' => 'Seller A']);
    $storeA = Store::factory()->create([
        'user_id' => $sellerA->id,
        'name' => 'Toko A Jakarta',
        'city' => 'Jakarta Pusat',
    ]);
    $productKaos = Product::factory()->create([
        'store_id' => $storeA->id,
        'title' => 'Produk Kaos Polos',
        'price' => 100000.00,
        'has_variants' => true,
    ]);
    $skuHitamM = ProductSku::factory()->create([
        'product_id' => $productKaos->id,
        'combination_key' => 'Hitam-M',
        'price' => 100000.00,
        'stock' => 10,
        'weight_gram' => 250,
    ]);
    $skuHitamL = ProductSku::factory()->create([
        'product_id' => $productKaos->id,
        'combination_key' => 'Hitam-L',
        'price' => 105000.00,
        'stock' => 10,
        'weight_gram' => 280,
    ]);

    // User B opens Toko B (Surabaya) and creates Topi
    $sellerB = User::factory()->create(['name' => 'Seller B']);
    $storeB = Store::factory()->create([
        'user_id' => $sellerB->id,
        'name' => 'Toko B Surabaya',
        'city' => 'Kota Surabaya',
    ]);
    $productTopi = Product::factory()->create([
        'store_id' => $storeB->id,
        'title' => 'Produk Topi Snapback',
        'price' => 50000.00,
        'has_variants' => true,
    ]);
    $skuTopi = ProductSku::factory()->create([
        'product_id' => $productTopi->id,
        'combination_key' => 'Hitam-AllSize',
        'price' => 50000.00,
        'stock' => 15,
        'weight_gram' => 150,
    ]);

    // -------------------------------------------------------------------------
    // Step 2: Buyer & Cart Setup with Multi-Seller Grouping
    // -------------------------------------------------------------------------
    $buyer = User::factory()->create(['name' => 'Buyer C']);
    $address = Address::factory()->create([
        'user_id' => $buyer->id,
        'full_address' => 'Jl. Dago No. 123, Bandung',
        'is_main' => true,
    ]);

    // Add Kaos Hitam-M (qty: 2) from Store A to Cart
    Cart::create([
        'user_id' => $buyer->id,
        'product_id' => $productKaos->id,
        'product_sku_id' => $skuHitamM->id,
        'quantity' => 2,
        'selected' => true,
    ]);

    // Add Topi (qty: 1) from Store B to Cart
    Cart::create([
        'user_id' => $buyer->id,
        'product_id' => $productTopi->id,
        'product_sku_id' => $skuTopi->id,
        'quantity' => 1,
        'selected' => true,
    ]);

    // Validate cart grouping per store
    $cartGroupingService = app(CartGroupingService::class);
    $groupedCart = $cartGroupingService->getGroupedCart($buyer->id);

    expect($groupedCart)->toHaveCount(2);
    $groupedStoreIds = array_map(fn ($group) => $group['store']['id'], $groupedCart);
    expect($groupedStoreIds)->toContain($storeA->id)
        ->and($groupedStoreIds)->toContain($storeB->id);

    // -------------------------------------------------------------------------
    // Step 3: Split Checkout & Concurrency
    // -------------------------------------------------------------------------
    $checkoutPayload = [
        'address_id' => $address->id,
        'stores' => [
            [
                'store_id' => $storeA->id,
                'courier_name' => 'jne',
                'courier_service' => 'REG',
            ],
            [
                'store_id' => $storeB->id,
                'courier_name' => 'sicepat',
                'courier_service' => 'SIUNT',
            ],
        ],
        'payment_method' => 'qris',
    ];

    $checkoutResponse = $this->actingAs($buyer)->post(route('checkout.processMulti'), $checkoutPayload);
    $checkoutResponse->assertSessionHasNoErrors();
    $checkoutResponse->assertRedirect(route('dashboard'));

    // OrderGroup created
    $orderGroup = OrderGroup::where('user_id', $buyer->id)->latest()->first();
    expect($orderGroup)->not->toBeNull()
        ->and($orderGroup->payment_status)->toBe('pending');

    // 2 SubOrders created
    $subOrders = SubOrder::where('order_group_id', $orderGroup->id)->get();
    expect($subOrders)->toHaveCount(2);

    $subOrderA = $subOrders->firstWhere('store_id', $storeA->id);
    $subOrderB = $subOrders->firstWhere('store_id', $storeB->id);

    expect($subOrderA)->not->toBeNull()
        ->and($subOrderB)->not->toBeNull()
        ->and(in_array($subOrderA->status, ['pending', 'waiting_payment']))->toBeTrue()
        ->and(in_array($subOrderB->status, ['pending', 'waiting_payment']))->toBeTrue();

    // Stock deducted atomically
    expect($skuHitamM->fresh()->stock)->toBe(8) // 10 - 2
        ->and($skuTopi->fresh()->stock)->toBe(14); // 15 - 1

    // -------------------------------------------------------------------------
    // Step 4: Midtrans Payment Simulation (SHA-512 Settlement Webhook)
    // -------------------------------------------------------------------------
    $serverKey = (string) config('midtrans.server_key');
    $grossAmount = (string) $orderGroup->total_amount;
    $signatureKey = hash('sha512', $orderGroup->group_code.'200'.$grossAmount.$serverKey);

    $webhookPayload = [
        'order_id' => $orderGroup->group_code,
        'status_code' => '200',
        'gross_amount' => $grossAmount,
        'transaction_status' => 'settlement',
        'signature_key' => $signatureKey,
    ];

    $webhookResponse = $this->postJson(route('api.midtrans.webhook'), $webhookPayload);
    $webhookResponse->assertOk();

    // Both OrderGroup and SubOrders must transition to paid
    expect($orderGroup->fresh()->payment_status)->toBe('paid')
        ->and($subOrderA->fresh()->status)->toBe('paid')
        ->and($subOrderB->fresh()->status)->toBe('paid');

    // -------------------------------------------------------------------------
    // Step 5: Seller Fulfillment (Accept & Ship)
    // -------------------------------------------------------------------------
    // Seller A accepts and ships
    $this->actingAs($sellerA)->post(route('seller.orders.accept', $subOrderA))->assertRedirect();
    expect($subOrderA->fresh()->status)->toBe('processing');

    $this->actingAs($sellerA)->post(route('seller.orders.ship', $subOrderA), [
        'tracking_number' => 'JNE12345678',
    ])->assertRedirect();
    expect($subOrderA->fresh()->status)->toBe('shipped')
        ->and($subOrderA->fresh()->tracking_number)->toBe('JNE12345678');

    // Seller B accepts and ships
    $this->actingAs($sellerB)->post(route('seller.orders.accept', $subOrderB))->assertRedirect();
    expect($subOrderB->fresh()->status)->toBe('processing');

    $this->actingAs($sellerB)->post(route('seller.orders.ship', $subOrderB), [
        'tracking_number' => 'SICEPAT98765',
    ])->assertRedirect();
    expect($subOrderB->fresh()->status)->toBe('shipped')
        ->and($subOrderB->fresh()->tracking_number)->toBe('SICEPAT98765');

    // -------------------------------------------------------------------------
    // Step 6: Buyer Completion & Escrow Release
    // -------------------------------------------------------------------------
    // Buyer completes SubOrder A
    $completeResponse = $this->actingAs($buyer)->post(route('orders.complete', $subOrderA));
    $completeResponse->assertRedirect();

    // Verify SubOrder A is completed
    expect($subOrderA->fresh()->status)->toBe('completed')
        ->and($subOrderA->fresh()->completed_at)->not->toBeNull();

    // Store A wallet credited with items_subtotal of SubOrder A
    $walletA = StoreWallet::where('store_id', $storeA->id)->first();
    expect($walletA)->not->toBeNull()
        ->and((float) $walletA->balance)->toBe((float) $subOrderA->items_subtotal);

    $txA = WalletTransaction::where('store_wallet_id', $walletA->id)->where('sub_order_id', $subOrderA->id)->first();
    expect($txA)->not->toBeNull()
        ->and($txA->type)->toBe('credit')
        ->and((float) $txA->amount)->toBe((float) $subOrderA->items_subtotal);

    // SubOrder B remains shipped and Store B has not received escrow
    expect($subOrderB->fresh()->status)->toBe('shipped');
    $walletB = StoreWallet::where('store_id', $storeB->id)->first();
    expect($walletB)->toBeNull();

    // -------------------------------------------------------------------------
    // Step 7: Verified Review
    // -------------------------------------------------------------------------
    $itemKaos = SubOrderItem::where('sub_order_id', $subOrderA->id)->first();
    $itemTopi = SubOrderItem::where('sub_order_id', $subOrderB->id)->first();

    // Buyer reviews item from completed SubOrder A -> Success
    $reviewResponse = $this->actingAs($buyer)->post(route('reviews.store'), [
        'sub_order_item_id' => $itemKaos->id,
        'rating' => 5,
        'review' => 'Bahan kaos sangat adem, jahitannya rapi, dan pengiriman super cepat!',
    ]);
    $reviewResponse->assertRedirect();
    $reviewResponse->assertSessionHas('success');

    $savedReview = ProductReview::where('sub_order_item_id', $itemKaos->id)->first();
    expect($savedReview)->not->toBeNull()
        ->and($savedReview->rating)->toBe(5)
        ->and($savedReview->product_id)->toBe($productKaos->id)
        ->and($savedReview->isVerifiedPurchase())->toBeTrue();

    // Buyer attempts to review item from uncompleted SubOrder B -> 403 Forbidden
    $uncompletedReviewResponse = $this->actingAs($buyer)->post(route('reviews.store'), [
        'sub_order_item_id' => $itemTopi->id,
        'rating' => 4,
        'review' => 'Mencoba mengulas barang yang belum selesai diterima.',
    ]);
    $uncompletedReviewResponse->assertForbidden();
    expect(ProductReview::where('sub_order_item_id', $itemTopi->id)->exists())->toBeFalse();
});
