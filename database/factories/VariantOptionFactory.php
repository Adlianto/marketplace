<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use App\Models\VariantOption;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VariantOption>
 */
class VariantOptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'variant_id' => ProductVariant::factory(),
            'value' => fake()->randomElement(['Hitam', 'Putih', 'Merah', 'Biru', 'S', 'M', 'L', 'XL', '128GB', '256GB']),
            'image' => null,
        ];
    }
}
