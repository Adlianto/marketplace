<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->words(3, true);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::random(6),
            'price' => fake()->numberBetween(10000, 500000),
            'original_price' => fake()->numberBetween(500000, 1000000),
            'discount' => fake()->numberBetween(5, 50),
            'city' => 'Jakarta Selatan',
            'rating' => 4.8,
            'sold_count' => '50+',
            'is_official' => true,
            'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
            'stock' => 15,
        ];
    }
}
