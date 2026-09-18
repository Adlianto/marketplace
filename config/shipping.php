<?php

/**
 * Konfigurasi Layanan Pengiriman / Logistik.
 *
 * Setiap kurir memiliki daftar service dengan:
 *   - name       : Label tampilan layanan
 *   - description: Deskripsi estimasi waktu pengiriman
 *   - base_rate  : Tarif dasar per kg (integer, Rupiah)
 *   - instant    : Apakah layanan instan (same-day / express, memerlukan koordinat lat/long)
 */
return [
    /*
    |--------------------------------------------------------------------------
    | Mode Kalkulasi
    |--------------------------------------------------------------------------
    | 'local'  – Driver simulasi lokal (sesuai base_rate di bawah).
    | 'api'    – Driver terhubung ke RajaOngkir / Biteship (belum aktif).
    */
    'driver' => env('SHIPPING_DRIVER', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Berat Minimum (gram)
    |--------------------------------------------------------------------------
    | Item tanpa berat SKU eksplisit akan menggunakan nilai default ini.
    */
    'default_weight_gram' => 200,

    /*
    |--------------------------------------------------------------------------
    | Kurir & Layanan Terstandarisasi
    |--------------------------------------------------------------------------
    */
    'couriers' => [
        'jne' => [
            'label' => 'JNE',
            'services' => [
                'REG' => [
                    'name' => 'JNE Reguler',
                    'description' => 'Estimasi 2–3 hari kerja',
                    'base_rate' => 8000,
                    'instant' => false,
                ],
                'YES' => [
                    'name' => 'JNE YES (Yakin Esok Sampai)',
                    'description' => 'Estimasi 1 hari kerja',
                    'base_rate' => 18000,
                    'instant' => false,
                ],
            ],
        ],

        'sicepat' => [
            'label' => 'SiCepat',
            'services' => [
                'SIUNT' => [
                    'name' => 'SiCepat SiUntung',
                    'description' => 'Estimasi 2–4 hari kerja',
                    'base_rate' => 7000,
                    'instant' => false,
                ],
                'BEST' => [
                    'name' => 'SiCepat BEST (Besok Sampai Tuntas)',
                    'description' => 'Estimasi 1 hari kerja',
                    'base_rate' => 15000,
                    'instant' => false,
                ],
            ],
        ],

        'gosend' => [
            'label' => 'GoSend',
            'services' => [
                'Instant' => [
                    'name' => 'GoSend Instant',
                    'description' => 'Estimasi 2–3 jam (intra-kota, memerlukan koordinat)',
                    'base_rate' => 12000,
                    'instant' => true,
                ],
            ],
        ],

        'grab' => [
            'label' => 'GrabExpress',
            'services' => [
                'Instant' => [
                    'name' => 'GrabExpress Instant',
                    'description' => 'Estimasi 2–3 jam (intra-kota, memerlukan koordinat)',
                    'base_rate' => 12000,
                    'instant' => true,
                ],
            ],
        ],
    ],
];
