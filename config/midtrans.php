<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | Konfigurasi kredensial dan preferensi integrasi Payment Gateway Midtrans.
    | server_key: Kunci privat server untuk otentikasi API Midtrans.
    | client_key: Kunci publik client untuk memuat widget Midtrans Snap di frontend.
    | is_production: false untuk Sandbox, true untuk Production.
    | is_sanitized: Sanitasi data otomatis pada permintaan transaksi.
    | is_3ds: Mengaktifkan autentikasi 3D Secure untuk pembayaran kartu kredit.
    |
    */

    'server_key' => env('MIDTRANS_SERVER_KEY'),

    'client_key' => env('MIDTRANS_CLIENT_KEY'),

    'is_production' => (bool) env('MIDTRANS_IS_PRODUCTION', false),

    'is_sanitized' => (bool) env('MIDTRANS_IS_SANITIZED', true),

    'is_3ds' => (bool) env('MIDTRANS_IS_3DS', true),
];
