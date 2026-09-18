<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'label' => 'Rumah',
            'receiver' => fake()->name(),
            'phone' => '08123456789',
            'full_address' => fake()->address(),
            'note' => 'Pagar hitam',
            'pinpoint' => 'Jakarta, Indonesia',
            'is_main' => true,
        ];
    }
}
