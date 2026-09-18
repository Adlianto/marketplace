<?php

use App\Models\Product;
use App\Models\Store;
use App\Models\User;

test('guest is redirected to login when accessing seller dashboard', function () {
    $response = $this->get(route('seller.dashboard'));
    $response->assertRedirect(route('login'));
});

test('buyer without store is redirected to store creation page with info flash message', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('seller.dashboard'));

    $response->assertRedirect(route('store.create'));
    $response->assertSessionHas('info', 'Silakan buka toko terlebih dahulu untuk mengakses dashboard penjual.');
});

test('seller with store can access seller dashboard and see performance metrics', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $user->id,
        'name' => 'Toko Komputer Juara',
        'slug' => 'toko-komputer-juara',
        'city' => 'Kota Jakarta Barat',
    ]);

    Product::factory()->count(3)->create([
        'store_id' => $store->id,
    ]);

    $response = $this->actingAs($user)->get(route('seller.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('seller/dashboard')
        ->where('store.id', $store->id)
        ->where('store.name', 'Toko Komputer Juara')
        ->where('metrics.active_products_count', 3)
        ->where('metrics.incoming_orders_count', 0)
        ->where('metrics.orders_to_ship_count', 0)
        ->has('recent_products', 3)
    );
});

test('buyer without store is redirected to store creation page when accessing settings', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('seller.settings.edit'));
    $response->assertRedirect(route('store.create'));
});

test('seller can view store and warehouse settings page', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('seller.settings.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('seller/settings')
        ->where('store.id', $store->id)
    );
});

test('seller can update store profile and logistics warehouse origin', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $user->id,
        'name' => 'Toko Lama',
        'city' => 'Kota Surabaya',
    ]);

    $payload = [
        'name' => 'Toko Baru Makmur',
        'description' => 'Deskripsi baru toko makmur sentosa.',
        'city' => 'Kota Surabaya Barat',
        'postal_code' => '60189',
        'origin_address' => 'Komplek Pergudangan Margomulyo Indah Blok C No. 12',
        'latitude' => -7.250445,
        'longitude' => 112.768845,
        'status' => 'vacation',
    ];

    $response = $this->actingAs($user)->patch(route('seller.settings.update'), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('seller.settings.edit'));
    $response->assertSessionHas('success', 'Pengaturan toko dan alamat gudang berhasil diperbarui.');

    $store->refresh();
    expect($store->name)->toBe('Toko Baru Makmur');
    expect($store->city)->toBe('Kota Surabaya Barat');
    expect($store->postal_code)->toBe('60189');
    expect($store->origin_address)->toBe('Komplek Pergudangan Margomulyo Indah Blok C No. 12');
    expect((float) $store->latitude)->toBe(-7.250445);
    expect((float) $store->longitude)->toBe(112.768845);
    expect($store->status)->toBe('vacation');
});

test('updating store settings validates required fields and coordinates range', function () {
    $user = User::factory()->create();
    Store::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->patch(route('seller.settings.update'), [
        'name' => 'ab', // min:3
        'city' => '', // required
        'postal_code' => 'bukan-angka', // regex
        'origin_address' => 'singkat', // min:10
        'latitude' => 120, // out of range
        'longitude' => -200, // out of range
        'status' => 'invalid_status', // in:active,vacation
    ]);

    $response->assertSessionHasErrors([
        'name',
        'city',
        'postal_code',
        'origin_address',
        'latitude',
        'longitude',
        'status',
    ]);
});
