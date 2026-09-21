<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductSku;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\StoreWallet;
use App\Models\User;
use App\Models\VariantOption;
use App\Models\WalletTransaction;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // =========================================================================
        // 1. AKUN PENGGUNA UTAMA (BUYER) & ALAMAT PENGIRIMAN
        // =========================================================================
        $this->command->info('1. Membuat akun buyer utama (Bell)...');

        $mainUser = User::firstOrCreate(
            ['email' => 'bell@marketplace.test'],
            [
                'name' => 'Bell',
                'password' => Hash::make('password'),
                'phone' => '081234567890',
                'email_verified_at' => now(),
            ]
        );

        // Alamat pengiriman utama untuk Bell sesuai instruksi & skema tabel addresses
        Address::updateOrCreate(
            [
                'user_id' => $mainUser->id,
                'label' => 'Rumah',
            ],
            [
                'receiver' => 'Bell',
                'phone' => '081234567890',
                'full_address' => 'Jl. Merdeka No. 45, Kedawung, Cirebon',
                'note' => 'Pagar hitam, dekat Masjid Al-Ikhlas (Kode Pos: 45153)',
                'pinpoint' => 'Cirebon, West Java, Indonesia',
                'is_main' => true,
            ]
        );

        // =========================================================================
        // 2. AKUN & TOKO MERCHANT (MULTI-ORIGIN STORES)
        // =========================================================================
        $this->command->info('2. Membuat akun penjual & toko multi-origin...');

        $storeConfigs = [
            [
                'seller_email' => 'seller.rog@marketplace.test',
                'seller_name' => 'ASUS ROG Official Store',
                'name' => 'ROG Official Store',
                'city' => 'Jakarta Pusat',
                'postal_code' => '10110',
                'origin_address' => 'Harco Mangga Dua Plaza Blok A No. 12, Sawah Besar, Jakarta Pusat',
                'description' => 'Distributor Resmi ASUS ROG Indonesia - Laptop Gaming, Desktop & Aksesoris ROG Terbaik.',
                'is_official' => true,
                'power_merchant' => true,
            ],
            [
                'seller_email' => 'seller.semarang@marketplace.test',
                'seller_name' => 'Semarang Computer Hub',
                'name' => 'Semarang Computer Hub',
                'city' => 'Semarang',
                'postal_code' => '50134',
                'origin_address' => 'Jl. Pandanaran No. 88, Mugassari, Semarang Selatan, Semarang',
                'description' => 'Pusat Komponen PC, Memory, Processor, dan Hardware Komputer Terlengkap Semarang.',
                'is_official' => false,
                'power_merchant' => true,
            ],
            [
                'seller_email' => 'seller.bandung@marketplace.test',
                'seller_name' => 'Bandung Gaming Gear',
                'name' => 'Bandung Gaming Gear',
                'city' => 'Bandung',
                'postal_code' => '40115',
                'origin_address' => 'BEC (Bandung Electronic Center) Lantai 2 Blok C-05, Jl. Purnawarman No. 13-15, Bandung',
                'description' => 'Spesialis Gaming Peripheral, Mouse, Mechanical Keyboard, Headset & Aksesoris Pro Gaming.',
                'is_official' => false,
                'power_merchant' => true,
            ],
            [
                'seller_email' => 'seller.surabaya@marketplace.test',
                'seller_name' => 'Surabaya Hardware Express',
                'name' => 'Surabaya Hardware Express',
                'city' => 'Surabaya',
                'postal_code' => '60271',
                'origin_address' => 'Hi-Tech Mall Lantai Dasar No. 18-20, Tambaksari, Surabaya',
                'description' => 'Gudang Hardware & Komponen Komputer Murah dan Bergaransi Resmi Jawa Timur.',
                'is_official' => false,
                'power_merchant' => true,
            ],
        ];

        /** @var array<string, Store> $storesByCity */
        $storesByCity = [];
        /** @var list<Store> $stores */
        $stores = [];

        foreach ($storeConfigs as $cfg) {
            $seller = User::firstOrCreate(
                ['email' => $cfg['seller_email']],
                [
                    'name' => $cfg['seller_name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            $store = Store::firstOrCreate(
                ['slug' => Str::slug($cfg['name'])],
                [
                    'user_id' => $seller->id,
                    'name' => $cfg['name'],
                    'city' => $cfg['city'],
                    'postal_code' => $cfg['postal_code'],
                    'origin_address' => $cfg['origin_address'],
                    'description' => $cfg['description'],
                    'status' => 'active',
                    'is_official' => $cfg['is_official'],
                    'power_merchant' => $cfg['power_merchant'],
                ]
            );

            // =====================================================================
            // 3. DOMPET & SALDO TOKO (STORE WALLET & RIWAYAT MUTASI AWAL)
            // =====================================================================
            $initialBalance = 5000000.00; // Modal awal toko Rp 5.000.000
            $wallet = StoreWallet::firstOrCreate(
                ['store_id' => $store->id],
                ['balance' => $initialBalance]
            );

            // Catat mutasi awal di wallet_transactions jika belum ada
            WalletTransaction::firstOrCreate(
                [
                    'store_wallet_id' => $wallet->id,
                    'type' => 'credit',
                    'description' => "Modal awal operasional toko {$store->name} (Initial Deposit)",
                ],
                [
                    'sub_order_id' => null,
                    'amount' => $initialBalance,
                ]
            );

            $storesByCity[$cfg['city']] = $store;
            $stores[] = $store;
        }

        // =========================================================================
        // 4. SEED KATEGORI PRODUK
        // =========================================================================
        $this->command->info('3. Membuat kategori produk...');

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

        // =========================================================================
        // 5. BUAT PRODUK SPESIFIK BERVARIAN BERTINGKAT (SKU MATRIX)
        // =========================================================================
        $this->command->info('4. Membuat produk khusus dengan varian bertingkat (SKU Matrix)...');

        // --- Produk Varian 1: ASUS ROG Zephyrus G16 (Toko ROG Jakarta Pusat) ---
        $rogStore = $storesByCity['Jakarta Pusat'];
        $productRog = Product::firstOrCreate(
            ['slug' => 'asus-rog-zephyrus-g16-oled-gaming-laptop'],
            [
                'store_id' => $rogStore->id,
                'category_id' => $catIds['Laptop Gaming'],
                'title' => 'ASUS ROG Zephyrus G16 OLED Gaming Laptop',
                'description' => 'Laptop gaming ultra-tipis premium dengan layar OLED 240Hz, ditenagai prosesor Intel Core Ultra dan grafis NVIDIA GeForce RTX 40 Series.',
                'price' => 34999000,
                'original_price' => 36999000,
                'discount' => 5,
                'city' => $rogStore->city,
                'rating' => 4.9,
                'sold_count' => '250+',
                'is_official' => true,
                'image' => 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
                'stock' => 58,
                'has_variants' => true,
            ]
        );

        $rogVarColor = ProductVariant::firstOrCreate(['product_id' => $productRog->id, 'name' => 'Warna']);
        VariantOption::firstOrCreate(['variant_id' => $rogVarColor->id, 'value' => 'Eclipse Gray']);
        VariantOption::firstOrCreate(['variant_id' => $rogVarColor->id, 'value' => 'Platinum White']);

        $rogVarSpec = ProductVariant::firstOrCreate(['product_id' => $productRog->id, 'name' => 'Spesifikasi']);
        VariantOption::firstOrCreate(['variant_id' => $rogVarSpec->id, 'value' => 'RTX 4070 / 32GB']);
        VariantOption::firstOrCreate(['variant_id' => $rogVarSpec->id, 'value' => 'RTX 4080 / 64GB']);

        $rogSkus = [
            [
                'sku_code' => 'ROG-G16-GRY-4070',
                'combination_key' => 'Eclipse Gray-RTX 4070 / 32GB',
                'price' => 34999000,
                'original_price' => 36999000,
                'stock' => 20,
                'weight_gram' => 2200,
                'image' => 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'sku_code' => 'ROG-G16-GRY-4080',
                'combination_key' => 'Eclipse Gray-RTX 4080 / 64GB',
                'price' => 42999000,
                'original_price' => 45000000,
                'stock' => 10,
                'weight_gram' => 2200,
                'image' => 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'sku_code' => 'ROG-G16-WHT-4070',
                'combination_key' => 'Platinum White-RTX 4070 / 32GB',
                'price' => 35499000,
                'original_price' => 37500000,
                'stock' => 18,
                'weight_gram' => 2200,
                'image' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'sku_code' => 'ROG-G16-WHT-4080',
                'combination_key' => 'Platinum White-RTX 4080 / 64GB',
                'price' => 43499000,
                'original_price' => 46000000,
                'stock' => 10,
                'weight_gram' => 2200,
                'image' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
            ],
        ];
        $createdRogSkus = [];
        foreach ($rogSkus as $rSku) {
            $createdRogSkus[$rSku['sku_code']] = ProductSku::updateOrCreate(
                ['sku_code' => $rSku['sku_code']],
                array_merge(['product_id' => $productRog->id], $rSku)
            );
        }

        // --- Produk Varian 2: Corsair Vengeance DDR5 (Toko Semarang Computer Hub) ---
        $semarangStore = $storesByCity['Semarang'];
        $productRam = Product::firstOrCreate(
            ['slug' => 'corsair-vengeance-rgb-ddr5-6000mhz-memory-kit'],
            [
                'store_id' => $semarangStore->id,
                'category_id' => $catIds['RAM & Memory'],
                'title' => 'Corsair Vengeance RGB DDR5 6000MHz Memory Kit',
                'description' => 'RAM DDR5 performa tinggi dengan pencahayaan RGB dinamis sepuluh zona, heatspreader aluminium solid, dan dukungan profil Intel XMP 3.0 / AMD EXPO.',
                'price' => 1850000,
                'original_price' => 2100000,
                'discount' => 12,
                'city' => $semarangStore->city,
                'rating' => 5.0,
                'sold_count' => '1.2k+',
                'is_official' => false,
                'image' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
                'stock' => 115,
                'has_variants' => true,
            ]
        );

        $ramVarColor = ProductVariant::firstOrCreate(['product_id' => $productRam->id, 'name' => 'Warna']);
        VariantOption::firstOrCreate(['variant_id' => $ramVarColor->id, 'value' => 'Hitam']);
        VariantOption::firstOrCreate(['variant_id' => $ramVarColor->id, 'value' => 'Putih']);

        $ramVarCap = ProductVariant::firstOrCreate(['product_id' => $productRam->id, 'name' => 'Kapasitas']);
        VariantOption::firstOrCreate(['variant_id' => $ramVarCap->id, 'value' => '32GB (2x16GB)']);
        VariantOption::firstOrCreate(['variant_id' => $ramVarCap->id, 'value' => '64GB (2x32GB)']);

        $ramSkus = [
            [
                'sku_code' => 'COR-DDR5-BLK-32',
                'combination_key' => 'Hitam-32GB (2x16GB)',
                'price' => 1850000,
                'original_price' => 2100000,
                'stock' => 45,
                'weight_gram' => 250,
                'image' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'sku_code' => 'COR-DDR5-BLK-64',
                'combination_key' => 'Hitam-64GB (2x32GB)',
                'price' => 3250000,
                'original_price' => 3600000,
                'stock' => 25,
                'weight_gram' => 250,
                'image' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'sku_code' => 'COR-DDR5-WHT-32',
                'combination_key' => 'Putih-32GB (2x16GB)',
                'price' => 1950000,
                'original_price' => 2200000,
                'stock' => 30,
                'weight_gram' => 250,
                'image' => 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80',
            ],
            [
                'sku_code' => 'COR-DDR5-WHT-64',
                'combination_key' => 'Putih-64GB (2x32GB)',
                'price' => 3350000,
                'original_price' => 3700000,
                'stock' => 15,
                'weight_gram' => 250,
                'image' => 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80',
            ],
        ];
        $createdRamSkus = [];
        foreach ($ramSkus as $mSku) {
            $createdRamSkus[$mSku['sku_code']] = ProductSku::updateOrCreate(
                ['sku_code' => $mSku['sku_code']],
                array_merge(['product_id' => $productRam->id], $mSku)
            );
        }

        // --- Produk Varian 3: Logitech G PRO X Superlight 2 (Toko Bandung Gaming Gear) ---
        $bandungStore = $storesByCity['Bandung'];
        $productMouse = Product::firstOrCreate(
            ['slug' => 'logitech-g-pro-x-superlight-2-wireless-gaming-mouse'],
            [
                'store_id' => $bandungStore->id,
                'category_id' => $catIds['PC Case & Cooling'],
                'title' => 'Logitech G PRO X Superlight 2 Wireless Gaming Mouse',
                'description' => 'Mouse esports legendaris berbobot hanya 60g dengan switch optik-mekanikal LIGHTFORCE dan sensor HERO 2 berpresisi tinggi.',
                'price' => 2199000,
                'original_price' => 2499000,
                'discount' => 12,
                'city' => $bandungStore->city,
                'rating' => 4.9,
                'sold_count' => '800+',
                'is_official' => false,
                'image' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
                'stock' => 90,
                'has_variants' => true,
            ]
        );

        $mouseVarColor = ProductVariant::firstOrCreate(['product_id' => $productMouse->id, 'name' => 'Warna']);
        VariantOption::firstOrCreate(['variant_id' => $mouseVarColor->id, 'value' => 'Black']);
        VariantOption::firstOrCreate(['variant_id' => $mouseVarColor->id, 'value' => 'White']);
        VariantOption::firstOrCreate(['variant_id' => $mouseVarColor->id, 'value' => 'Magenta']);

        $mouseVarBundle = ProductVariant::firstOrCreate(['product_id' => $productMouse->id, 'name' => 'Paket Bundle']);
        VariantOption::firstOrCreate(['variant_id' => $mouseVarBundle->id, 'value' => 'Standar']);
        VariantOption::firstOrCreate(['variant_id' => $mouseVarBundle->id, 'value' => 'Bundle Grip Tape & Skates']);

        $mouseSkus = [
            ['sku_code' => 'LOG-GPX2-BLK-STD', 'combination_key' => 'Black-Standar', 'price' => 2199000, 'original_price' => 2499000, 'stock' => 25, 'weight_gram' => 300, 'image' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80'],
            ['sku_code' => 'LOG-GPX2-BLK-BND', 'combination_key' => 'Black-Bundle Grip Tape & Skates', 'price' => 2399000, 'original_price' => 2699000, 'stock' => 15, 'weight_gram' => 350, 'image' => 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80'],
            ['sku_code' => 'LOG-GPX2-WHT-STD', 'combination_key' => 'White-Standar', 'price' => 2199000, 'original_price' => 2499000, 'stock' => 20, 'weight_gram' => 300, 'image' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'],
            ['sku_code' => 'LOG-GPX2-WHT-BND', 'combination_key' => 'White-Bundle Grip Tape & Skates', 'price' => 2399000, 'original_price' => 2699000, 'stock' => 10, 'weight_gram' => 350, 'image' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'],
            ['sku_code' => 'LOG-GPX2-MAG-STD', 'combination_key' => 'Magenta-Standar', 'price' => 2299000, 'original_price' => 2599000, 'stock' => 12, 'weight_gram' => 300, 'image' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'],
            ['sku_code' => 'LOG-GPX2-MAG-BND', 'combination_key' => 'Magenta-Bundle Grip Tape & Skates', 'price' => 2499000, 'original_price' => 2799000, 'stock' => 8, 'weight_gram' => 350, 'image' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'],
        ];
        foreach ($mouseSkus as $moSku) {
            ProductSku::updateOrCreate(
                ['sku_code' => $moSku['sku_code']],
                array_merge(['product_id' => $productMouse->id], $moSku)
            );
        }

        // =========================================================================
        // 6. GENERATE KATALOG PRODUK REGULER MASSAL (DEFAULT SKU)
        // =========================================================================
        $this->command->info('5. Menghasilkan katalog produk reguler dengan Default SKU...');

        $brands = [
            'ASUS ROG', 'MSI Gaming', 'Lenovo Legion', 'Acer Predator', 'Gigabyte AORUS',
            'Corsair', 'Intel', 'AMD', 'NVIDIA', 'Kingston Fury',
            'Samsung Evo', 'NZXT', 'Lian Li', 'Seasonic', 'G.Skill Trident',
            'ZOTAC', 'Sapphire', 'PowerColor', 'ASRock', 'Galax',
        ];

        $series = [
            'GeForce RTX 4090 24GB', 'GeForce RTX 4080 Super 16GB', 'GeForce RTX 4070 Ti 12GB', 'GeForce RTX 4060 8GB',
            'Radeon RX 7900 XTX 24GB', 'Radeon RX 7800 XT 16GB', 'Radeon RX 7600 8GB', 'Ryzen 9 9950X', 'Ryzen 7 7800X3D', 'Ryzen 5 7600X',
            'Core i9 14900K', 'Core i7 14700K', 'Core i5 13400F', 'Arc A770 16GB',
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

        $totalRecords = 300; // 300 produk reguler sudah sangat kaya untuk katalog & cepat dieksekusi
        $batchSize = 100;
        $catKeys = array_keys($catIds);

        $currentRegularCount = Product::where('has_variants', false)->count();
        if ($currentRegularCount < $totalRecords) {
            $needed = $totalRecords - $currentRegularCount;
            $batches = ceil($needed / $batchSize);

            for ($i = 0; $i < $batches; $i++) {
                $batch = [];
                $limit = min($batchSize, $needed - ($i * $batchSize));
                for ($j = 0; $j < $limit; $j++) {
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
                        'description' => "Produk hardware komputer {$title} original garansi resmi distributor Indonesia. Tersedia di {$assignedStore->name}.",
                        'slug' => Str::slug($title).'-'.Str::random(6),
                        'price' => $price,
                        'original_price' => $originalPrice,
                        'discount' => $discount,
                        'city' => $assignedStore->city,
                        'rating' => number_format(rand(42, 50) / 10, 1),
                        'sold_count' => rand(10, 5000).'+',
                        'is_official' => $assignedStore->is_official,
                        'image' => $images[array_rand($images)],
                        'stock' => rand(50, 100), // Stok 50-100 sesuai instruksi
                        'has_variants' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                Product::insert($batch);
            }
        }

        // Generate Default SKU untuk semua produk yang tidak memiliki varian
        Product::where('has_variants', false)->chunk(100, function ($products) use ($faker) {
            foreach ($products as $product) {
                ProductSku::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'combination_key' => 'Default',
                    ],
                    [
                        'sku_code' => 'SKU-'.$product->id.'-DEF',
                        'price' => $product->price,
                        'original_price' => $product->original_price,
                        'stock' => $product->stock,
                        'weight_gram' => rand(200, 2500),
                        'image' => $product->image,
                    ]
                );

                if ($product->specifications()->doesntExist()) {
                    $product->specifications()->createMany([
                        ['name' => 'Kondisi', 'value' => $faker->randomElement(['Baru (Segel Box)', 'Baru (BNOB)'])],
                        ['name' => 'Berat Satuan', 'value' => $faker->numberBetween(200, 2500).' g'],
                        ['name' => 'Min. Beli', 'value' => '1 Buah'],
                        ['name' => 'Kategori', 'value' => 'Komponen PC & Laptop'],
                        ['name' => 'Garansi', 'value' => $faker->randomElement(['1 Tahun Resmi', '2 Tahun Distributor', '3 Tahun'])],
                    ]);
                }

                if ($product->reviews()->doesntExist()) {
                    $reviews = [];
                    $reviewCount = rand(1, 3);
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
                            'created_at' => $faker->dateTimeBetween('-3 months', 'now'),
                            'updated_at' => now(),
                        ];
                    }
                    ProductReview::insert($reviews);
                }
            }
        });

        // =========================================================================
        // 7. DATA KERANJANG AKTIF SIAP CHECKOUT (PRE-FILLED CART UNTUK BELL)
        // =========================================================================
        $this->command->info('6. Mengisi keranjang belanja aktif untuk akun Bell (Multi-Store Cart)...');

        // Kosongkan keranjang lama Bell jika ada
        Cart::where('user_id', $mainUser->id)->delete();

        // Item 1: Produk Varian dari Toko ROG Official Store (Jakarta Pusat)
        $skuRogItem = $createdRogSkus['ROG-G16-GRY-4070'];
        Cart::create([
            'user_id' => $mainUser->id,
            'product_id' => $productRog->id,
            'product_sku_id' => $skuRogItem->id,
            'quantity' => 1,
            'selected' => true,
        ]);

        // Item 2: Produk Varian dari Toko Semarang Computer Hub (Semarang)
        $skuRamItem = $createdRamSkus['COR-DDR5-BLK-32'];
        Cart::create([
            'user_id' => $mainUser->id,
            'product_id' => $productRam->id,
            'product_sku_id' => $skuRamItem->id,
            'quantity' => 2,
            'selected' => true,
        ]);

        $this->command->info('Ekosistem dummy data berhasil dibuat dan siap diuji secara End-to-End!');
    }
}
