<?php

namespace Database\Factories;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Store>
 */
class StoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company().' Store';

        return [
            'user_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(6)),
            'logo' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
            'banner' => 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
            'description' => fake()->paragraph(),
            'city' => 'Kota Jakarta Selatan',
            'postal_code' => '12190',
            'origin_address' => fake()->address(),
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'status' => 'active',
            'is_official' => false,
            'power_merchant' => false,
        ];
    }
}
