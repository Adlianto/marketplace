<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\StoreWallet;
use App\Models\User;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // 1. BUAT AKUN UTAMA (BELL) & SELLER TESTING
        $mainUser = User::firstOrCreate(
            ['email' => 'bell@marketplace.test'],
            [
                'name' => 'Bell',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $sellerUser = User::firstOrCreate(
            ['email' => 'seller@marketplace.test'],
            [
                'name' => 'Official Tech Store',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Tambah alamat pengiriman default untuk Bell sesuai skema addresses
        $mainUser->addresses()->create([
            'label' => 'Rumah',
            'receiver' => 'Bell',
            'phone' => '081234567890',
            'full_address' => 'Jl. Merdeka No. 45, Kedawung, Cirebon, Jawa Barat 45153',
            'note' => 'Pagar warna hitam dekat masjid',
            'pinpoint' => 'Cirebon, West Java, Indonesia',
            'is_main' => true,
        ]);

        // 2. BUAT TOKO (MULTI-ORIGIN STORES) DENGAN DOMPET ESCROW
        $storeTemplates = [
            ['name' => 'ROG Official Store', 'city' => 'Jakarta Pusat', 'postal_code' => '10110'],
            ['name' => 'Semarang Computer Hub', 'city' => 'Semarang', 'postal_code' => '50134'],
            ['name' => 'Bandung Gaming Gear', 'city' => 'Bandung', 'postal_code' => '40115'],
            ['name' => 'Surabaya Hardware Express', 'city' => 'Surabaya', 'postal_code' => '60271'],
        ];

        $stores = [];
        foreach ($storeTemplates as $idx => $tmpl) {
            $owner = ($idx === 0) ? $sellerUser : User::factory()->create();

            $store = Store::firstOrCreate(
                ['slug' => Str::slug($tmpl['name'])],
                [
                    'user_id' => $owner->id,
                    'name' => $tmpl['name'],
                    'city' => $tmpl['city'],
                    'postal_code' => $tmpl['postal_code'],
                    'origin_address' => "Komplek Pergudangan Hardware Blok B{$idx}, {$tmpl['city']}",
                    'description' => "Distributor resmi hardware & peripheral komputer di kota {$tmpl['city']}.",
                    'status' => 'active',
                    'is_official' => ($idx === 0),
                    'power_merchant' => true,
                ]
            );

            // Inisialisasi saldo dompet toko
            StoreWallet::firstOrCreate(
                ['store_id' => $store->id],
                ['balance' => 0]
            );

            $stores[] = $store;
        }

        // 3. SEED KATEGORI PRODUK
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
            'Monitor & Display',
        ];

        $catIds = [];
        foreach ($categories as $cat) {
            $model = Category::firstOrCreate(
                ['slug' => Str::slug($cat)],
                ['name' => $cat]
            );
            $catIds[$cat] = $model->id;
        }

        // 4. TEMPLATE DATA HARDWARE
        $brands = [
            'ASUS ROG', 'MSI', 'Lenovo Legion', 'Acer Predator', 'Gigabyte AORUS',
            'Corsair', 'Intel', 'AMD', 'NVIDIA', 'Radeon', 'Kingston Fury',
            'Samsung Evo', 'NZXT', 'Lian Li', 'Seasonic', 'G.Skill Trident',
            'ZOTAC', 'Sapphire', 'PowerColor', 'ASRock', 'Galax',
        ];

        $series = [
            'GeForce RTX 4090 24GB', 'GeForce RTX 4080 Super 16GB', 'GeForce RTX 4070 Ti 12GB', 'GeForce RTX 4060 8GB',
            'Radeon RX 7900 XTX 24GB', 'Radeon RX 7800 XT 16GB', 'Radeon RX 7600 8GB', 'Ryzen 9 9950X', 'Ryzen 7 7800X3D', 'Ryzen 5 7600X',
            'Core i9 14900K', 'Core i7 14700K', 'Core i5 13400F', 'Arc A770 16GB', 'Iris Xe MAX Graphics', 'Intel Iris Plus',
            '32GB DDR5 6000MHz', '64GB DDR5 6400MHz', '2TB NVMe Gen4 SSD', '4TB NVMe Gen5 SSD',
            '1000W 80+ Gold PSU', '1200W 80+ Platinum PSU', 'AIO Liquid Cooler 360mm',
            'Zephyrus G16 OLED', 'Legion Pro 7i', 'Mag Forge ARGB Case', 'O11 Dynamic EVO',
        ];

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
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60',
        ];

        $totalRecords = 1000;
        $batchSize = 100;
        $catKeys = array_keys($catIds);

        $this->command->info("Generating {$totalRecords} multi-store products...");

        for ($i = 0; $i < $totalRecords / $batchSize; $i++) {
            $batch = [];
            for ($j = 0; $j < $batchSize; $j++) {
                $brand = $brands[array_rand($brands)];
                $itemSeries = $series[array_rand($series)];
                $title = "{$brand} {$itemSeries} ".rand(100, 9999).' Special Edition';
                $catName = $catKeys[array_rand($catKeys)];

                $assignedStore = $stores[array_rand($stores)];

                $price = rand(500, 45000) * 1000;
                $hasDiscount = rand(0, 1) === 1;
                $discount = $hasDiscount ? rand(5, 50) : null;
                $originalPrice = $hasDiscount ? round($price / (1 - ($discount / 100))) : null;

                $batch[] = [
                    'store_id' => $assignedStore->id,
                    'category_id' => $catIds[$catName],
                    'title' => $title,
                    'slug' => Str::slug($title).'-'.Str::random(6),
                    'price' => $price,
                    'original_price' => $originalPrice,
                    'discount' => $discount,
                    'city' => $assignedStore->city,
                    'rating' => number_format(rand(42, 50) / 10, 1),
                    'sold_count' => rand(10, 5000).'+',
                    'is_official' => $assignedStore->is_official,
                    'image' => $images[array_rand($images)],
                    'stock' => rand(20, 500),
                    'has_variants' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            Product::insert($batch);
        }

        $this->command->info('Products inserted. Now generating SKUs, specs, and reviews...');

        // 5. GENERATE DEFAULT SKU, SPESIFIKASI & REVIEW
        Product::chunk(100, function ($products) use ($faker) {
            foreach ($products as $product) {
                ProductSku::create([
                    'product_id' => $product->id,
                    'sku_code' => 'SKU-'.$product->id.'-DEF',
                    'combination_key' => 'Default',
                    'price' => $product->price,
                    'original_price' => $product->original_price,
                    'stock' => $product->stock,
                    'weight_gram' => rand(200, 2500),
                    'image' => $product->image,
                ]);

                $product->specifications()->createMany([
                    ['name' => 'Kondisi', 'value' => $faker->randomElement(['Baru (Segel Box)', 'Baru (BNOB)', 'Pernah Dipakai'])],
                    ['name' => 'Berat Satuan', 'value' => $faker->numberBetween(200, 2500).' g'],
                    ['name' => 'Min. Beli', 'value' => '1 Buah'],
                    ['name' => 'Kategori', 'value' => 'Komponen PC & Laptop'],
                    ['name' => 'Garansi', 'value' => $faker->randomElement(['1 Tahun Resmi', '2 Tahun Distributor', '3 Tahun'])],
                ]);

                $reviewCount = rand(2, 5);
                $reviews = [];
                for ($k = 0; $k < $reviewCount; $k++) {
                    $reviews[] = [
                        'product_id' => $product->id,
                        'user_name' => $faker->name,
                        'user_avatar' => 'https://api.dicebear.com/7.x/notionists/svg?seed='.rand(1, 2000),
                        'rating' => $faker->numberBetween(4, 5),
                        'comment' => $faker->randomElement([
                            'Barang sampai dengan aman, packing kayu tebal! Suhu adem.',
                            'Performa mantap buat rendering dan gaming berat. Sellernya ramah.',
                            'Sesuai deskripsi, garansi resmi. Recommended seller pokoknya!',
                            'Pengiriman cepat banget, kemarin pesan hari ini langsung nyampe.',
                        ]),
                        'created_at' => $faker->dateTimeBetween('-6 months', 'now'),
                        'updated_at' => now(),
                    ];
                }
                ProductReview::insert($reviews);
            }
        });

        $this->command->info('Database seeding completed successfully!');
    }
}
