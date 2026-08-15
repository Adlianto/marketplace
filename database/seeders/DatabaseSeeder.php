<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Laptop Gaming',
            'Laptop Ultrabook',
            'Processor & CPU',
            'VGA & Graphic Card',
            'Motherboard',
            'RAM & Memory',
            'SSD & Storage',
            'Power Supply & PSU',
            'PC Case & Cooling',
            'Monitor & Display'
        ];

        $catIds = [];
        foreach ($categories as $cat) {
            $model = Category::firstOrCreate(
                ['slug' => Str::slug($cat)],
                ['name' => $cat]
            );
            $catIds[$cat] = $model->id;
        }

        // Komponen Data Generator PC & Laptop
        $brands = ['ASUS ROG', 'MSI', 'Lenovo Legion', 'Acer Predator', 'Gigabyte AORUS', 'Corsair', 'Intel', 'AMD Ryzen', 'NVIDIA GeForce', 'Kingston Fury', 'Samsung Evo', 'NZXT', 'Lian Li', 'Seasonic', 'G.Skill Trident'];
        $series = ['RTX 4090 24GB', 'RTX 4070 Ti Super', 'RX 7900 XTX 24GB', 'Core i9 14900K', 'Ryzen 7 7800X3D', '32GB DDR5 6000MHz', '2TB NVMe Gen4', '1000W 80+ Gold', 'AIO Liquid 360mm', 'Zephyrus G16 OLED', 'Legion Pro 7i', 'Mag Forge ARGB'];
        $cities = ['Jakarta Pusat', 'Jakarta Barat', 'Jakarta Selatan', 'Bandung', 'Surabaya', 'Tangerang', 'Semarang', 'Yogyakarta', 'Medan'];
        $images = [
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&auto=format&fit=crop&q=60',
        ];

        $totalRecords = 10000;
        $batchSize = 1000;
        $catKeys = array_keys($catIds);

        for ($i = 0; $i < $totalRecords / $batchSize; $i++) {
            $batch = [];
            for ($j = 0; $j < $batchSize; $j++) {
                $brand = $brands[array_rand($brands)];
                $itemSeries = $series[array_rand($series)];
                $title = "{$brand} {$itemSeries} " . rand(100, 999) . " Special Edition";
                $catName = $catKeys[array_rand($catKeys)];
                
                $price = rand(500, 45000) * 1000;
                $hasDiscount = rand(0, 1) === 1;
                $discount = $hasDiscount ? rand(5, 40) : null;
                $originalPrice = $hasDiscount ? round($price / (1 - ($discount / 100))) : null;

                $batch[] = [
                    'category_id' => $catIds[$catName],
                    'title' => $title,
                    'slug' => Str::slug($title) . '-' . Str::random(6),
                    'price' => $price,
                    'original_price' => $originalPrice,
                    'discount' => $discount,
                    'city' => $cities[array_rand($cities)],
                    'rating' => number_format(rand(45, 50) / 10, 1),
                    'sold_count' => rand(10, 2000) . '+',
                    'is_official' => rand(0, 1) === 1,
                    'image' => $images[array_rand($images)],
                    'stock' => rand(5, 200),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            Product::insert($batch);
        }
    }
}