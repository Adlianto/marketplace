<?php

namespace Database\Factories;

use App\Models\OrderGroup;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<OrderGroup>
 */
class OrderGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'group_code' => 'TRX-'.date('Ymd').'-'.strtoupper(Str::random(6)),
            'user_id' => User::factory(),
            'total_amount' => 150000,
            'payment_status' => 'pending',
            'snap_token' => null,
        ];
    }
}
