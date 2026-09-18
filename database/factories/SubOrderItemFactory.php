<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductSku;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubOrderItem>
 */
class SubOrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sub_order_id' => SubOrder::factory(),
            'product_id' => Product::factory(),
            'product_sku_id' => ProductSku::factory(),
            'product_title' => 'Produk Pilihan Marketplace',
            'sku_combination' => 'Hitam-M',
            'price' => 75000,
            'quantity' => 1,
            'total_price' => 75000,
            'weight_gram' => 200,
        ];
    }
}
