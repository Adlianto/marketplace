<?php

use App\Models\Product;
use App\Models\ProductSku;
use App\Models\ProductVariant;
use App\Models\VariantOption;

test('product can have multiple variants and skus with correct relationships', function () {
    $product = Product::factory()->create([
        'title' => 'Kemeja Casual Premium',
        'has_variants' => true,
    ]);

    // Create variants
    $variantColor = ProductVariant::factory()->create([
        'product_id' => $product->id,
        'name' => 'Warna',
    ]);

    $variantSize = ProductVariant::factory()->create([
        'product_id' => $product->id,
        'name' => 'Ukuran',
    ]);

    // Create options
    $optionRed = VariantOption::factory()->create([
        'variant_id' => $variantColor->id,
        'value' => 'Merah',
    ]);
    $optionBlack = VariantOption::factory()->create([
        'variant_id' => $variantColor->id,
        'value' => 'Hitam',
    ]);

    $optionM = VariantOption::factory()->create([
        'variant_id' => $variantSize->id,
        'value' => 'M',
    ]);
    $optionL = VariantOption::factory()->create([
        'variant_id' => $variantSize->id,
        'value' => 'L',
    ]);

    // Create SKUs
    $sku1 = ProductSku::factory()->create([
        'product_id' => $product->id,
        'sku_code' => 'KCP-RED-M',
        'combination_key' => 'Merah-M',
        'price' => 150000,
        'original_price' => 175000,
        'stock' => 25,
        'weight_gram' => 250,
    ]);

    $sku2 = ProductSku::factory()->create([
        'product_id' => $product->id,
        'sku_code' => 'KCP-BLK-L',
        'combination_key' => 'Hitam-L',
        'price' => 160000,
        'original_price' => 185000,
        'stock' => 15,
        'weight_gram' => 260,
    ]);

    // Test product relationships
    expect($product->variants)->toHaveCount(2)
        ->and($product->skus)->toHaveCount(2)
        ->and($variantColor->product->id)->toBe($product->id)
        ->and($variantColor->options)->toHaveCount(2)
        ->and($sku1->product->id)->toBe($product->id)
        ->and($sku1->stock)->toBe(25)
        ->and($sku1->weight_gram)->toBe(250)
        ->and((float) $sku1->price)->toBe(150000.0);
});

test('deleting a product cascades to its variants, options, and skus', function () {
    $product = Product::factory()->create(['has_variants' => true]);

    $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'name' => 'Warna']);
    $option = VariantOption::factory()->create(['variant_id' => $variant->id, 'value' => 'Biru']);
    $sku = ProductSku::factory()->create([
        'product_id' => $product->id,
        'sku_code' => 'TEST-SKU-001',
        'combination_key' => 'Biru',
    ]);

    $product->delete();

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
    $this->assertDatabaseMissing('product_variants', ['id' => $variant->id]);
    $this->assertDatabaseMissing('variant_options', ['id' => $option->id]);
    $this->assertDatabaseMissing('product_skus', ['id' => $sku->id]);
});

test('sku_code enforces unique constraint', function () {
    $product = Product::factory()->create();

    ProductSku::factory()->create([
        'product_id' => $product->id,
        'sku_code' => 'DUPLICATE-SKU-101',
        'combination_key' => 'Biru-S',
    ]);

    expect(function () use ($product) {
        ProductSku::factory()->create([
            'product_id' => $product->id,
            'sku_code' => 'DUPLICATE-SKU-101',
            'combination_key' => 'Biru-M',
        ]);
    })->toThrow(Exception::class);
});
