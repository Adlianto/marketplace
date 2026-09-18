<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\OrderGroup;
use App\Models\Store;
use App\Models\SubOrder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SubOrder>
 */
class SubOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_group_id' => OrderGroup::factory(),
            'store_id' => Store::factory(),
            'user_id' => User::factory(),
            'address_id' => Address::factory(),
            'sub_order_number' => 'INV-'.date('Ymd').'-'.strtoupper(Str::random(8)),
            'courier_name' => 'JNE',
            'courier_service' => 'REG',
            'tracking_number' => null,
            'items_subtotal' => 135000,
            'shipping_cost' => 15000,
            'total_amount' => 150000,
            'status' => 'waiting_payment',
            'shipped_at' => null,
            'delivered_at' => null,
            'completed_at' => null,
        ];
    }
}
