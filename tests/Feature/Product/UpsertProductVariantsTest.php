<?php

use App\Actions\Product\GenerateProductSkusAction;
use App\Actions\Product\UpsertProductWithVariantsAction;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\User;
use App\Models\VariantOption;

test('seller with active store can successfully create a product with 2-dimensional variants and skus', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $user->id,
        'name' => 'Toko Fashion Modern',
        'city' => 'Kota Bandung',
        'status' => 'active',
    ]);

    $category = Category::factory()->create(['name' => 'Pakaian Pria']);

    $payload = [
        'title' => 'Kaos Polos Combed 30s Premium',
        'description' => 'Kaos katun combed 30s adem dan lembut.',
        'category_id' => $category->id,
        'image' => 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
        'variants' => [
            [
                'name' => 'Warna',
                'options' => ['Hitam', 'Putih'],
            ],
            [
                'name' => 'Ukuran',
                'options' => ['M', 'L'],
            ],
        ],
        'skus' => [
            [
                'combination_key' => 'Hitam-M',
                'price' => 85000,
                'original_price' => 100000,
                'stock' => 25,
                'weight_gram' => 200,
            ],
            [
                'combination_key' => 'Hitam-L',
                'price' => 85000,
                'original_price' => 100000,
                'stock' => 15,
                'weight_gram' => 220,
            ],
            [
                'combination_key' => 'Putih-M',
                'price' => 80000,
                'original_price' => 95000,
                'stock' => 20,
                'weight_gram' => 200,
            ],
            [
                'combination_key' => 'Putih-L',
                'price' => 80000,
                'original_price' => 95000,
                'stock' => 10,
                'weight_gram' => 220,
            ],
        ],
    ];

    $response = $this->actingAs($user)->post(route('seller.products.store'), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('seller.dashboard'));
    $response->assertSessionHas('success', 'Produk bervarian berhasil disimpan.');

    // Assert Product creation & aggregated attributes
    $product = Product::where('title', 'Kaos Polos Combed 30s Premium')->first();
    expect($product)->not->toBeNull()
        ->and($product->store_id)->toBe($store->id)
        ->and($product->has_variants)->toBeTrue()
        ->and($product->stock)->toBe(70) // 25 + 15 + 20 + 10
        ->and((float) $product->price)->toBe(85000.0);

    // Assert Variants (2 dimensions)
    expect($product->variants)->toHaveCount(2);
    $variantNames = $product->variants->pluck('name')->all();
    expect($variantNames)->toContain('Warna', 'Ukuran');

    // Assert Variant Options (4 options)
    $optionCount = VariantOption::whereIn('variant_id', $product->variants->pluck('id'))->count();
    expect($optionCount)->toBe(4);

    // Assert Product SKUs (4 rows)
    expect($product->skus)->toHaveCount(4);
    $combinationKeys = $product->skus->pluck('combination_key')->all();
    expect($combinationKeys)->toEqualCanonicalizing(['Hitam-M', 'Hitam-L', 'Putih-M', 'Putih-L']);

    // Assert SKU codes were automatically generated
    foreach ($product->skus as $sku) {
        expect($sku->sku_code)->toMatch('/^SKU-'.$product->id.'-[A-Z0-9]{6}$/');
    }
});

test('rolls back entire database transaction when an error occurs during sku persistence', function () {
    $store = Store::factory()->create(['name' => 'Toko Gagal']);
    $category = Category::factory()->create();

    $action = new UpsertProductWithVariantsAction(new GenerateProductSkusAction);

    $payloadWithInvalidSku = [
        'title' => 'Produk Rollback Test',
        'category_id' => $category->id,
        'variants' => [
            [
                'name' => 'Warna',
                'options' => ['Merah'],
            ],
        ],
        'skus' => [
            [
                'combination_key' => 'Merah',
                'price' => 50000,
                'stock' => 10,
                'weight_gram' => 200,
            ],
            [
                // Missing price which violates NOT NULL constraint in database
                'combination_key' => 'Merah-Corrupt',
                'price' => null,
                'stock' => 5,
                'weight_gram' => 200,
            ],
        ],
    ];

    try {
        $action->execute($store, $payloadWithInvalidSku);
    } catch (Throwable $e) {
        // Expected database exception due to NOT NULL violation on price
    }

    // Assert that the transaction was completely rolled back and no orphan records exist
    expect(Product::where('title', 'Produk Rollback Test')->count())->toBe(0)
        ->and(ProductVariant::where('name', 'Warna')->count())->toBe(0)
        ->and(VariantOption::where('value', 'Merah')->count())->toBe(0)
        ->and(ProductSku::where('combination_key', 'Merah')->count())->toBe(0);
});

test('prevents buyer without store from creating product with variants', function () {
    $buyer = User::factory()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($buyer)->post(route('seller.products.store'), [
        'title' => 'Produk Ilegal',
        'category_id' => $category->id,
        'variants' => [
            ['name' => 'Warna', 'options' => ['Hitam']],
        ],
        'skus' => [
            ['combination_key' => 'Hitam', 'price' => 50000, 'stock' => 10, 'weight_gram' => 200],
        ],
    ]);

    $response->assertRedirect(route('store.create'));
    expect(Product::where('title', 'Produk Ilegal')->count())->toBe(0);
});

test('validates nested variant and sku constraints', function () {
    $seller = User::factory()->create();
    Store::factory()->create(['user_id' => $seller->id]);

    $response = $this->actingAs($seller)->post(route('seller.products.store'), [
        'title' => '',
        'category_id' => 999999, // Non-existent category
        'variants' => [], // Empty variants
        'skus' => [
            [
                'combination_key' => '',
                'price' => 500, // min:1000 violation
                'stock' => -1, // min:0 violation
                'weight_gram' => 0, // min:1 violation
            ],
        ],
    ]);

    $response->assertSessionHasErrors([
        'title',
        'category_id',
        'variants',
        'skus.0.combination_key',
        'skus.0.price',
        'skus.0.stock',
        'skus.0.weight_gram',
    ]);
});
