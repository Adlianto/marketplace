<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSpecification;
use App\Models\ProductReview;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

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

        // Variasi Brand & Seri (Makin Lengkap: Intel, AMD, NVIDIA, Iris)
        $brands = [
            'ASUS ROG', 'MSI', 'Lenovo Legion', 'Acer Predator', 'Gigabyte AORUS', 
            'Corsair', 'Intel', 'AMD', 'NVIDIA', 'Radeon', 'Kingston Fury', 
            'Samsung Evo', 'NZXT', 'Lian Li', 'Seasonic', 'G.Skill Trident',
            'ZOTAC', 'Sapphire', 'PowerColor', 'ASRock', 'Galax'
        ];

        $series = [
            // NVIDIA
            'GeForce RTX 4090 24GB', 'GeForce RTX 4080 Super 16GB', 'GeForce RTX 4070 Ti 12GB', 'GeForce RTX 4060 8GB',
            // AMD / Radeon
            'Radeon RX 7900 XTX 24GB', 'Radeon RX 7800 XT 16GB', 'Radeon RX 7600 8GB', 'Ryzen 9 9950X', 'Ryzen 7 7800X3D', 'Ryzen 5 7600X',
            // Intel
            'Core i9 14900K', 'Core i7 14700K', 'Core i5 13400F', 'Arc A770 16GB', 'Iris Xe MAX Graphics', 'Intel Iris Plus',
            // Laptop & Components
            '32GB DDR5 6000MHz', '64GB DDR5 6400MHz', '2TB NVMe Gen4 SSD', '4TB NVMe Gen5 SSD',
            '1000W 80+ Gold PSU', '1200W 80+ Platinum PSU', 'AIO Liquid Cooler 360mm',
            'Zephyrus G16 OLED', 'Legion Pro 7i', 'Mag Forge ARGB Case', 'O11 Dynamic EVO'
        ];

        $cities = ['Jakarta Pusat', 'Jakarta Barat', 'Jakarta Selatan', 'Bandung', 'Surabaya', 'Tangerang', 'Semarang', 'Yogyakarta', 'Medan', 'Malang', 'Denpasar', 'Makassar'];
        
        // Variasi Image Unsplash (Tema Hardware, Motherboard, GPU, Laptop)
        $images = [
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=500&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60'
        ];

        // SET TOTAL PRODUK JADI 1000
        $totalRecords = 1000;
        $batchSize = 100;
        $catKeys = array_keys($catIds);

        $this->command->info("Generating {$totalRecords} products... This might take a few seconds.");

        for ($i = 0; $i < $totalRecords / $batchSize; $i++) {
            $batch = [];
            for ($j = 0; $j < $batchSize; $j++) {
                $brand = $brands[array_rand($brands)];
                $itemSeries = $series[array_rand($series)];
                $title = "{$brand} {$itemSeries} " . rand(100, 9999) . " Special Edition";
                $catName = $catKeys[array_rand($catKeys)];
                
                $price = rand(500, 45000) * 1000;
                $hasDiscount = rand(0, 1) === 1;
                $discount = $hasDiscount ? rand(5, 50) : null;
                $originalPrice = $hasDiscount ? round($price / (1 - ($discount / 100))) : null;

                $batch[] = [
                    'category_id' => $catIds[$catName],
                    'title' => $title,
                    'slug' => Str::slug($title) . '-' . Str::random(6),
                    'price' => $price,
                    'original_price' => $originalPrice,
                    'discount' => $discount,
                    'city' => $cities[array_rand($cities)],
                    'rating' => number_format(rand(42, 50) / 10, 1),
                    'sold_count' => rand(10, 5000) . '+',
                    'is_official' => rand(0, 1) === 1,
                    'image' => $images[array_rand($images)],
                    'stock' => rand(5, 500),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            Product::insert($batch);
        }

        $this->command->info("Products generated. Now generating specifications and reviews...");

        // GENERATE SPESIFIKASI & ULASAN DUMMY UNTUK 1000 PRODUK
        $faker = Faker::create('id_ID');
        
        // Memakai chunk agar tidak membebani RAM saat update 1000 produk
        Product::chunk(100, function ($products) use ($faker) {
            foreach ($products as $product) {
                // 1. Generate Spesifikasi
                $product->specifications()->createMany([
                    ['name' => 'Kondisi', 'value' => $faker->randomElement(['Baru (Segel Box)', 'Baru (BNOB)', 'Pernah Dipakai'])],
                    ['name' => 'Berat Satuan', 'value' => $faker->numberBetween(150, 4500) . ' g'],
                    ['name' => 'Min. Beli', 'value' => '1 Buah'],
                    ['name' => 'Kategori', 'value' => 'Komponen PC & Laptop'],
                    ['name' => 'Garansi', 'value' => $faker->randomElement(['1 Tahun Resmi', '2 Tahun Distributor', '3 Tahun', 'Garansi Global', 'Tanpa Garansi'])],
                ]);

                // 2. Generate Ulasan (3-8 ulasan per produk)
                $reviewCount = rand(3, 8);
                $reviews = [];
                for ($k = 0; $k < $reviewCount; $k++) {
                    $reviews[] = [
                        'product_id' => $product->id,
                        'user_name' => $faker->name,
                        'user_avatar' => 'https://api.dicebear.com/7.x/notionists/svg?seed=' . rand(1, 2000),
                        'rating' => $faker->numberBetween(4, 5),
                        'comment' => $faker->randomElement([
                            'Barang sampai dengan aman, packing tebal! Suhu adem, mantap.',
                            'Performa gila banget buat rendering dan gaming AAA. Sellernya juga ramah.',
                            'Sesuai deskripsi, garansi resmi. Recommended seller pokoknya!',
                            'Pengiriman cepat pake banget, kemarin pesan pakai Gojek hari ini nyampe.',
                            'Harga termurah se-Tokopedia, kualitas bintang 5.',
                            'Mantap jiwa, rakitan PC jadi makin gahar berkat komponen ini.',
                            'Awalnya ragu, tapi pas dicoba buat benchmark nilainya tembus rekor!'
                        ]),
                        'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
                        'updated_at' => now(),
                    ];
                }
                ProductReview::insert($reviews);
            }
        });

        $this->command->info("All 1000 products, specs, and reviews seeded successfully!");
    }
}