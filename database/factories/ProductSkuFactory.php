<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductSku;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductSku>
 */
class ProductSkuFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $price = fake()->numberBetween(50000, 500000);

        return [
            'product_id' => Product::factory(),
            'sku_code' => 'SKU-'.strtoupper(Str::random(8)),
            'combination_key' => fake()->randomElement(['Hitam-M', 'Hitam-L', 'Putih-M', 'Putih-L']),
            'price' => $price,
            'original_price' => $price + 20000,
            'stock' => fake()->numberBetween(5, 100),
            'weight_gram' => 200,
            'image' => null,
        ];
    }
}
