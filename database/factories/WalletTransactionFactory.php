<?php

namespace Database\Factories;

use App\Models\StoreWallet;
use App\Models\SubOrder;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WalletTransaction>
 */
class WalletTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'store_wallet_id' => StoreWallet::factory(),
            'sub_order_id' => SubOrder::factory(),
            'type' => 'credit',
            'amount' => 50000.00,
            'description' => 'Pencairan dana penjualan pesanan',
        ];
    }
}
