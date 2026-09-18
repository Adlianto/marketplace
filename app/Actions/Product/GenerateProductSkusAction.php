<?php

namespace App\Actions\Product;

use Illuminate\Support\Str;

class GenerateProductSkusAction
{
    /**
     * Generate Cartesian product combinations from multi-dimensional variant arrays.
     *
     * Example input:
     * ['Warna' => ['Hitam', 'Putih'], 'Ukuran' => ['S', 'M', 'L']]
     * Output:
     * ['Hitam-S', 'Hitam-M', 'Hitam-L', 'Putih-S', 'Putih-M', 'Putih-L']
     *
     * @param  array<string|int, array<int, string>>  $variantOptionsArrays
     * @return array<int, string>
     */
    public function generateCombinations(array $variantOptionsArrays): array
    {
        // Filter out empty arrays
        $filtered = array_filter($variantOptionsArrays, fn ($options): bool => count($options) > 0);

        if (empty($filtered)) {
            return [];
        }

        $result = [[]];

        foreach ($filtered as $propertyValues) {
            $tmp = [];
            foreach ($result as $resultItem) {
                foreach ($propertyValues as $propertyValue) {
                    $tmp[] = [...$resultItem, (string) $propertyValue];
                }
            }
            $result = $tmp;
        }

        return array_map(
            fn (array $item): string => implode('-', $item),
            $result
        );
    }

    /**
     * Generate a standardized unique SKU code format: SKU-{PRODUCT_ID}-{RANDOM_HASH}.
     */
    public function generateSkuCode(int|string $productId, int $hashLength = 6): string
    {
        $hash = strtoupper(Str::random($hashLength));

        return "SKU-{$productId}-{$hash}";
    }

    /**
     * Generate a structured SKU matrix containing combination keys and default attributes.
     *
     * @param  array<string|int, array<int, string>>  $variantOptionsArrays
     * @param  array<string, mixed>  $defaults
     * @return array<int, array<string, mixed>>
     */
    public function generateSkuMatrix(int|string $productId, array $variantOptionsArrays, array $defaults = []): array
    {
        $combinations = $this->generateCombinations($variantOptionsArrays);

        return array_map(function (string $combination) use ($productId, $defaults): array {
            return [
                'product_id' => $productId,
                'sku_code' => $this->generateSkuCode($productId),
                'combination_key' => $combination,
                'price' => $defaults['price'] ?? 0,
                'original_price' => $defaults['original_price'] ?? null,
                'stock' => $defaults['stock'] ?? 0,
                'weight_gram' => $defaults['weight_gram'] ?? 200,
                'image' => $defaults['image'] ?? null,
            ];
        }, $combinations);
    }
}
