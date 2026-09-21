<?php

use App\Actions\Product\UpsertProductWithVariantsAction;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Category;
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
use Illuminate\Support\Facades\Hash;

it('executes the complete 8-scenario end-to-end user journey flawlessly', function () {
    // =========================================================================
    // SKENARIO A: Merchant Onboarding (Buka Toko Baru)
    // =========================================================================
    $merchantUser = User::create([
        'name' => 'Vertex Merchant',
        'email' => 'vertex.seller@marketplace.test',
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
    ]);

    $storePayload = [
        'name' => 'Vertex Hardware Official',
        'slug' => 'vertex-hardware-official',
        'city' => 'Bandung',
        'postal_code' => '40115',
        'origin_address' => 'Jl. Dago No. 88, Coblong, Bandung',
        'description' => 'Toko resmi komponen hardware & peripheral gaming performa tinggi.',
    ];

    $openStoreResponse = $this->actingAs($merchantUser)->post(route('store.store'), $storePayload);
    $openStoreResponse->assertRedirect(route('seller.dashboard'));
    $openStoreResponse->assertSessionHas('success');

    $vertexStore = Store::where('user_id', $merchantUser->id)->first();
    expect($vertexStore)->not->toBeNull()
        ->and($vertexStore->name)->toBe('Vertex Hardware Official')
        ->and($vertexStore->slug)->toBe('vertex-hardware-official')
        ->and($vertexStore->city)->toBe('Bandung');

    // Verifikasi otomatis inisialisasi dompet toko saldo 0
    $vertexWallet = StoreWallet::where('store_id', $vertexStore->id)->first();
    expect($vertexWallet)->not->toBeNull()
        ->and((float) $vertexWallet->balance)->toBe(0.0);

    // Toko kedua ( ROG Official Store di Jakarta Pusat )
    $sellerJakarta = User::create([
        'name' => 'ROG Seller',
        'email' => 'rog.seller@marketplace.test',
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
    ]);
    $jakartaStore = Store::create([
        'user_id' => $sellerJakarta->id,
        'name' => 'ROG Official Jakarta',
        'slug' => 'rog-official-jakarta',
        'city' => 'Jakarta Pusat',
        'postal_code' => '10110',
        'origin_address' => 'Mangga Dua Mall Lt. 4, Jakarta Pusat',
        'description' => 'Official ROG Store Jakarta',
        'status' => 'active',
        'is_official' => true,
    ]);
    StoreWallet::create([
        'store_id' => $jakartaStore->id,
        'balance' => 0.0,
    ]);

    // =========================================================================
    // SKENARIO B: Tambah Produk Varian (SKU Matrix)
    // =========================================================================
    $category = Category::firstOrCreate(['slug' => 'ram-memory'], ['name' => 'RAM & Memory']);

    $variantProductData = [
        'category_id' => $category->id,
        'title' => 'Corsair Vengeance DDR5 RGB 6000MHz',
        'description' => 'Memory gaming DDR5 dual channel performa tinggi dengan heatsink aluminium.',
        'image' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        'variants' => [
            [
                'name' => 'Warna',
                'options' => ['Hitam', 'Putih'],
            ],
            [
                'name' => 'Kapasitas',
                'options' => ['32GB', '64GB'],
            ],
        ],
        'skus' => [
            [
                'combination_key' => 'Hitam-32GB',
                'price' => 1850000,
                'original_price' => 2000000,
                'stock' => 15,
                'weight_gram' => 250,
            ],
            [
                'combination_key' => 'Hitam-64GB',
                'price' => 3450000,
                'original_price' => 3700000,
                'stock' => 8,
                'weight_gram' => 280,
            ],
            [
                'combination_key' => 'Putih-32GB',
                'price' => 1900000,
                'original_price' => 2100000,
                'stock' => 12,
                'weight_gram' => 250,
            ],
            [
                'combination_key' => 'Putih-64GB',
                'price' => 3550000,
                'original_price' => 3800000,
                'stock' => 6,
                'weight_gram' => 280,
            ],
        ],
    ];

    /** @var UpsertProductWithVariantsAction $upsertAction */
    $upsertAction = app(UpsertProductWithVariantsAction::class);
    $variantProduct = $upsertAction->execute($vertexStore, $variantProductData);

    expect($variantProduct->has_variants)->toBeTrue()
        ->and($variantProduct->stock)->toBe(41); // 15 + 8 + 12 + 6

    $variantSkus = ProductSku::where('product_id', $variantProduct->id)->get();
    expect($variantSkus)->toHaveCount(4);

    $skuHitam32 = $variantSkus->firstWhere('combination_key', 'Hitam-32GB');
    $skuPutih64 = $variantSkus->firstWhere('combination_key', 'Putih-64GB');

    expect($skuHitam32)->not->toBeNull()
        ->and((float) $skuHitam32->price)->toBe(1850000.0)
        ->and($skuHitam32->stock)->toBe(15)
        ->and($skuPutih64)->not->toBeNull()
        ->and((float) $skuPutih64->price)->toBe(3550000.0)
        ->and($skuPutih64->stock)->toBe(6);

    // Produk Reguler (Default SKU) di Toko Jakarta
    $regProduct = Product::create([
        'store_id' => $jakartaStore->id,
        'category_id' => $category->id,
        'title' => 'Thermal Paste Kryonaut Extreme 2g',
        'slug' => 'thermal-paste-kryonaut-extreme-2g',
        'price' => 175000,
        'stock' => 50,
        'city' => $jakartaStore->city,
        'has_variants' => false,
    ]);
    $defaultSkuReg = ProductSku::create([
        'product_id' => $regProduct->id,
        'sku_code' => 'SKU-'.$regProduct->id.'-DEF',
        'combination_key' => 'Default',
        'price' => 175000,
        'stock' => 50,
        'weight_gram' => 100,
    ]);

    // =========================================================================
    // SKENARIO C: Add to Cart & Validasi SKU Fallback
    // =========================================================================
    $buyer = User::firstOrCreate(
        ['email' => 'bell@marketplace.test'],
        [
            'name' => 'Bell',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]
    );

    $buyerAddress = Address::firstOrCreate(
        ['user_id' => $buyer->id],
        [
            'label' => 'Rumah Utama',
            'receiver' => 'Bell',
            'phone' => '081234567890',
            'full_address' => 'Jl. Merdeka No. 45, Cirebon, Jawa Barat 45153',
            'is_main' => true,
        ]
    );

    // Bersihkan keranjang sebelumnya agar steril
    Cart::where('user_id', $buyer->id)->delete();

    // 1. Tambah produk reguler TANPA menyertakan product_sku_id (uji fallback otomatis)
    $addRegCart = $this->actingAs($buyer)->post(route('cart.store'), [
        'product_id' => $regProduct->id,
        'quantity' => 2,
    ]);
    $addRegCart->assertRedirect();

    // 2. Tambah produk bervarian DENGAN spesifik SKU (Hitam-32GB qty: 1)
    $addVarCart = $this->actingAs($buyer)->post(route('cart.store'), [
        'product_id' => $variantProduct->id,
        'product_sku_id' => $skuHitam32->id,
        'quantity' => 1,
    ]);
    $addVarCart->assertRedirect();

    // Verifikasi entri keranjang
    $buyerCarts = Cart::where('user_id', $buyer->id)->get();
    expect($buyerCarts)->toHaveCount(2);

    $cartReg = $buyerCarts->firstWhere('product_id', $regProduct->id);
    $cartVar = $buyerCarts->firstWhere('product_id', $variantProduct->id);

    expect($cartReg->product_sku_id)->toBe($defaultSkuReg->id) // Berhasil fallback ke default SKU!
        ->and($cartVar->product_sku_id)->toBe($skuHitam32->id)
        ->and($cartReg->quantity)->toBe(2)
        ->and($cartVar->quantity)->toBe(1);

    // Validasi CartGroupingService menghasilkan 2 grup toko terpisah (Bandung & Jakarta)
    $cartGroupingService = app(CartGroupingService::class);
    $groupedCart = $cartGroupingService->getGroupedCart($buyer->id);

    expect($groupedCart)->toHaveCount(2);
    $originCities = array_map(fn ($g) => $g['store']['city'], $groupedCart);
    expect($originCities)->toContain('Bandung')
        ->and($originCities)->toContain('Jakarta Pusat');

    // =========================================================================
    // SKENARIO D: Multi-Store Split Checkout & Snap Midtrans
    // =========================================================================
    $checkoutPayload = [
        'address_id' => $buyerAddress->id,
        'payment_method' => 'qris',
        'stores' => [
            [
                'store_id' => $vertexStore->id,
                'courier_name' => 'jne',
                'courier_service' => 'REG',
            ],
            [
                'store_id' => $jakartaStore->id,
                'courier_name' => 'sicepat',
                'courier_service' => 'SIUNT',
            ],
        ],
    ];

    $checkoutResponse = $this->actingAs($buyer)->post(route('checkout.processMulti'), $checkoutPayload);
    $checkoutResponse->assertSessionHasNoErrors();

    $orderGroup = OrderGroup::where('user_id', $buyer->id)->latest()->first();
    expect($orderGroup)->not->toBeNull()
        ->and($orderGroup->payment_status)->toBe('pending');

    $subOrders = SubOrder::where('order_group_id', $orderGroup->id)->get();
    expect($subOrders)->toHaveCount(2);

    $subOrderVertex = $subOrders->firstWhere('store_id', $vertexStore->id);
    $subOrderJakarta = $subOrders->firstWhere('store_id', $jakartaStore->id);

    expect($subOrderVertex)->not->toBeNull()
        ->and($subOrderJakarta)->not->toBeNull()
        ->and(in_array($subOrderVertex->status, ['pending', 'waiting_payment']))->toBeTrue()
        ->and(in_array($subOrderJakarta->status, ['pending', 'waiting_payment']))->toBeTrue();

    // Verifikasi stok terpotong secara atomik
    expect($skuHitam32->fresh()->stock)->toBe(14) // 15 - 1
        ->and($defaultSkuReg->fresh()->stock)->toBe(48); // 50 - 2

    // =========================================================================
    // SKENARIO E: Webhook Settlement & Escrow Isolation
    // =========================================================================
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

    // Verifikasi status pembayaran dan transisi FSM
    expect($orderGroup->fresh()->payment_status)->toBe('paid')
        ->and($subOrderVertex->fresh()->status)->toBe('paid')
        ->and($subOrderJakarta->fresh()->status)->toBe('paid');

    // Verifikasi isolasi escrow: Saldo dompet toko kedua seller MASIH 0 (belum dicairkan)
    expect((float) $vertexWallet->fresh()->balance)->toBe(0.0)
        ->and((float) StoreWallet::where('store_id', $jakartaStore->id)->first()->balance)->toBe(0.0);

    // =========================================================================
    // SKENARIO F: Seller Fulfillment (Penerimaan & Input Resi)
    // =========================================================================
    // 1. Seller Vertex menerima pesanan -> processing
    $acceptResponse = $this->actingAs($merchantUser)->post(route('seller.orders.accept', $subOrderVertex));
    $acceptResponse->assertRedirect();
    expect($subOrderVertex->fresh()->status)->toBe('processing');

    // 2. Seller Vertex mengirim pesanan dengan nomor resi tervalidasi
    $shipTrackingNumber = 'JNE-BDG-99881122';
    $shipResponse = $this->actingAs($merchantUser)->post(route('seller.orders.ship', $subOrderVertex), [
        'tracking_number' => $shipTrackingNumber,
    ]);
    $shipResponse->assertRedirect();

    $shippedSubOrderVertex = $subOrderVertex->fresh();
    expect($shippedSubOrderVertex->status)->toBe('shipped')
        ->and($shippedSubOrderVertex->tracking_number)->toBe($shipTrackingNumber)
        ->and($shippedSubOrderVertex->shipped_at)->not->toBeNull();

    // Seller Jakarta juga mengirim barangnya
    $this->actingAs($sellerJakarta)->post(route('seller.orders.accept', $subOrderJakarta))->assertRedirect();
    $this->actingAs($sellerJakarta)->post(route('seller.orders.ship', $subOrderJakarta), [
        'tracking_number' => 'SICEPAT-JKT-776655',
    ])->assertRedirect();
    expect($subOrderJakarta->fresh()->status)->toBe('shipped');

    // =========================================================================
    // SKENARIO G: Buyer Confirmation & Escrow Release
    // =========================================================================
    $completeResponse = $this->actingAs($buyer)->post(route('orders.complete', $shippedSubOrderVertex));
    $completeResponse->assertRedirect();

    $completedVertex = $shippedSubOrderVertex->fresh();
    expect($completedVertex->status)->toBe('completed')
        ->and($completedVertex->completed_at)->not->toBeNull();

    // Verifikasi Escrow cair ke dompet toko Vertex
    $updatedVertexWallet = $vertexWallet->fresh();
    expect((float) $updatedVertexWallet->balance)->toBe((float) $completedVertex->items_subtotal)
        ->and((float) $updatedVertexWallet->balance)->toBe(1850000.0);

    // Verifikasi pencatatan audit mutasi dompet
    $walletTx = WalletTransaction::where('store_wallet_id', $vertexWallet->id)
        ->where('sub_order_id', $completedVertex->id)
        ->first();

    expect($walletTx)->not->toBeNull()
        ->and($walletTx->type)->toBe('credit')
        ->and((float) $walletTx->amount)->toBe(1850000.0)
        ->and($walletTx->description)->toContain((string) $completedVertex->sub_order_number);

    // SubOrder Jakarta masih shipped dan saldonya belum dilepas
    expect($subOrderJakarta->fresh()->status)->toBe('shipped')
        ->and((float) StoreWallet::where('store_id', $jakartaStore->id)->first()->balance)->toBe(0.0);

    // =========================================================================
    // SKENARIO H: Ulasan Produk Terverifikasi (Verified Review)
    // =========================================================================
    $itemVertex = SubOrderItem::where('sub_order_id', $completedVertex->id)->first();
    $itemJakarta = SubOrderItem::where('sub_order_id', $subOrderJakarta->id)->first();

    // 1. Pembeli memberi ulasan pada pesanan yang sudah 'completed' -> SUKSES
    $reviewResponse = $this->actingAs($buyer)->post(route('reviews.store'), [
        'sub_order_item_id' => $itemVertex->id,
        'rating' => 5,
        'review' => 'RAM Corsair DDR5 original bergaransi resmi, RGB sangat elegan dan kecepatan stabil di 6000MHz!',
    ]);
    $reviewResponse->assertRedirect();
    $reviewResponse->assertSessionHas('success');

    $review = ProductReview::where('sub_order_item_id', $itemVertex->id)->first();
    expect($review)->not->toBeNull()
        ->and($review->rating)->toBe(5)
        ->and($review->product_id)->toBe($variantProduct->id)
        ->and($review->isVerifiedPurchase())->toBeTrue();

    // 2. Pembeli mencoba memberi ulasan pada pesanan yang BELUM selesai (status: shipped) -> GAGAL (403 Forbidden)
    $uncompletedReviewResponse = $this->actingAs($buyer)->post(route('reviews.store'), [
        'sub_order_item_id' => $itemJakarta->id,
        'rating' => 5,
        'review' => 'Mencoba mengulas padahal barang masih dalam pengiriman.',
    ]);
    $uncompletedReviewResponse->assertForbidden();
    expect(ProductReview::where('sub_order_item_id', $itemJakarta->id)->exists())->toBeFalse();
});
