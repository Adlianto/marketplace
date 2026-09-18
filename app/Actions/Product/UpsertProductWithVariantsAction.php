<?php

namespace App\Actions\Product;

use App\Models\Product;
use App\Models\ProductSku;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\VariantOption;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UpsertProductWithVariantsAction
{
    public function __construct(
        public GenerateProductSkusAction $skuGenerator
    ) {}

    /**
     * Atomically create or update a product with its multi-dimensional variants and SKU matrix.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(Store $store, array $data, ?Product $product = null): Product
    {
        return DB::transaction(function () use ($store, $data, $product): Product {
            $isNew = $product === null;

            if ($isNew) {
                $product = new Product;
                $product->slug = Str::slug($data['title']).'-'.Str::random(6);
            }

            // Calculate aggregated stock and base display price from SKUs
            $totalStock = array_sum(array_column($data['skus'], 'stock'));
            $firstSkuPrice = $data['skus'][0]['price'] ?? 0;

            $product->store_id = $store->id;
            $product->category_id = $data['category_id'];
            $product->title = $data['title'];
            $product->description = $data['description'] ?? null;
            $product->image = $data['image'] ?? null;
            $product->price = $data['price'] ?? $firstSkuPrice;
            $product->stock = $totalStock;
            $product->has_variants = true;
            $product->city = $store->city;
            $product->is_official = $store->is_official;
            $product->save();

            // Refresh variants and options: clear existing if updating
            if (! $isNew) {
                $product->variants()->delete();
                $product->skus()->delete();
            }

            // Insert Variants and Option values
            foreach ($data['variants'] as $variantData) {
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'name' => $variantData['name'],
                ]);

                foreach ($variantData['options'] as $option) {
                    $optionValue = is_array($option) ? ($option['value'] ?? '') : (string) $option;
                    $optionImage = is_array($option) ? ($option['image'] ?? null) : null;

                    VariantOption::create([
                        'variant_id' => $variant->id,
                        'value' => $optionValue,
                        'image' => $optionImage,
                    ]);
                }
            }

            // Insert SKU Matrix rows
            foreach ($data['skus'] as $skuData) {
                $skuCode = ! empty($skuData['sku_code'])
                    ? (string) $skuData['sku_code']
                    : $this->skuGenerator->generateSkuCode($product->id);

                ProductSku::create([
                    'product_id' => $product->id,
                    'sku_code' => $skuCode,
                    'combination_key' => $skuData['combination_key'],
                    'price' => $skuData['price'],
                    'original_price' => $skuData['original_price'] ?? null,
                    'stock' => $skuData['stock'],
                    'weight_gram' => $skuData['weight_gram'] ?? 200,
                    'image' => $skuData['image'] ?? null,
                ]);
            }

            return $product->load(['variants.options', 'skus']);
        });
    }
}
