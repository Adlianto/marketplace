<?php

use App\Models\Store;
use App\Models\User;

test('guest is redirected to login when attempting to access seller dashboard or settings', function () {
    $this->get(route('seller.dashboard'))->assertRedirect(route('login'));
    $this->get(route('seller.settings.edit'))->assertRedirect(route('login'));
    $this->patch(route('seller.settings.update'), [])->assertRedirect(route('login'));
});

test('buyer without store is prevented from accessing seller dashboard and redirected to store creation', function () {
    $buyer = User::factory()->create();

    $response = $this->actingAs($buyer)->get(route('seller.dashboard'));

    $response->assertRedirect(route('store.create'));
    $response->assertSessionHas('info', 'Silakan buka toko terlebih dahulu untuk mengakses dashboard penjual.');
});

test('buyer without store is prevented from accessing seller settings and redirected to store creation', function () {
    $buyer = User::factory()->create();

    $response = $this->actingAs($buyer)->get(route('seller.settings.edit'));

    $response->assertRedirect(route('store.create'));
    $response->assertSessionHas('info', 'Silakan buka toko terlebih dahulu untuk mengakses dashboard penjual.');
});

test('buyer without store cannot perform settings update action', function () {
    $buyer = User::factory()->create();

    $response = $this->actingAs($buyer)->patch(route('seller.settings.update'), [
        'name' => 'Toko Palsu',
        'city' => 'Kota Jakarta',
        'postal_code' => '12345',
        'origin_address' => 'Jl. Palsu No. 123',
    ]);

    $response->assertRedirect(route('store.create'));
});

test('seller with active store can access seller dashboard and see statistics', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $seller->id,
        'name' => 'Toko Mitra Resmi',
        'status' => 'active',
    ]);

    $response = $this->actingAs($seller)->get(route('seller.dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('seller/dashboard')
        ->where('store.id', $store->id)
        ->where('store.name', 'Toko Mitra Resmi')
        ->has('metrics.active_products_count')
        ->has('metrics.incoming_orders_count')
        ->has('metrics.orders_to_ship_count')
        ->has('metrics.wallet_balance')
        ->has('recent_products')
    );
});

test('seller can access seller settings page', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $seller->id,
        'name' => 'Toko Elektronik Hebat',
        'city' => 'Kota Bandung',
    ]);

    $response = $this->actingAs($seller)->get(route('seller.settings.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('seller/settings')
        ->where('store.id', $store->id)
        ->where('store.name', 'Toko Elektronik Hebat')
        ->where('store.city', 'Kota Bandung')
    );
});

test('seller can update their own store profile and warehouse origin address', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $seller->id,
        'name' => 'Toko Original',
        'city' => 'Kota Surabaya',
        'postal_code' => '60111',
        'origin_address' => 'Jl. Asli No. 1, Genteng, Surabaya',
        'status' => 'active',
    ]);

    $response = $this->actingAs($seller)->patch(route('seller.settings.update'), [
        'name' => 'Toko Original Baru',
        'city' => 'Kota Malang',
        'postal_code' => '65111',
        'origin_address' => 'Jl. Ijen No. 99, Klojen, Kota Malang',
        'description' => 'Toko resmi pindah gudang ke Malang.',
        'status' => 'vacation',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('seller.settings.edit'));
    $response->assertSessionHas('success', 'Pengaturan toko dan alamat gudang berhasil diperbarui.');

    $this->assertDatabaseHas('stores', [
        'id' => $store->id,
        'user_id' => $seller->id,
        'name' => 'Toko Original Baru',
        'city' => 'Kota Malang',
        'postal_code' => '65111',
        'origin_address' => 'Jl. Ijen No. 99, Klojen, Kota Malang',
        'description' => 'Toko resmi pindah gudang ke Malang.',
        'status' => 'vacation',
    ]);
});

test('anti-IDOR: seller update request cannot modify another sellers store data', function () {
    $victimUser = User::factory()->create();
    $victimStore = Store::factory()->create([
        'user_id' => $victimUser->id,
        'name' => 'Toko Korban Aman',
        'city' => 'Kota Denpasar',
        'postal_code' => '80111',
        'origin_address' => 'Jl. Teuku Umar No. 10, Denpasar',
        'status' => 'active',
    ]);

    $attackerUser = User::factory()->create();
    $attackerStore = Store::factory()->create([
        'user_id' => $attackerUser->id,
        'name' => 'Toko Penyerang',
        'city' => 'Kota Jakarta Barat',
        'postal_code' => '11480',
        'origin_address' => 'Jl. Daan Mogot No. 50, Jakarta',
        'status' => 'active',
    ]);

    // Attacker attempts to tamper with victim store by injecting store_id/id into the payload
    $response = $this->actingAs($attackerUser)->patch(route('seller.settings.update'), [
        'store_id' => $victimStore->id,
        'id' => $victimStore->id,
        'name' => 'Toko Penyerang Update',
        'city' => 'Kota Tangerang',
        'postal_code' => '15111',
        'origin_address' => 'Jl. MH Thamrin No. 88, Tangerang',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('seller.settings.edit'));

    // Verify Victim store remains completely intact
    $this->assertDatabaseHas('stores', [
        'id' => $victimStore->id,
        'user_id' => $victimUser->id,
        'name' => 'Toko Korban Aman',
        'city' => 'Kota Denpasar',
        'postal_code' => '80111',
        'origin_address' => 'Jl. Teuku Umar No. 10, Denpasar',
    ]);

    // Verify only Attacker store was updated
    $this->assertDatabaseHas('stores', [
        'id' => $attackerStore->id,
        'user_id' => $attackerUser->id,
        'name' => 'Toko Penyerang Update',
        'city' => 'Kota Tangerang',
        'postal_code' => '15111',
        'origin_address' => 'Jl. MH Thamrin No. 88, Tangerang',
    ]);
});

test('seller cannot update store name to another existing stores name', function () {
    $existingSeller = User::factory()->create();
    Store::factory()->create([
        'user_id' => $existingSeller->id,
        'name' => 'Toko Bintang Lima',
    ]);

    $currentSeller = User::factory()->create();
    Store::factory()->create([
        'user_id' => $currentSeller->id,
        'name' => 'Toko Biasa Saja',
    ]);

    $response = $this->actingAs($currentSeller)->patch(route('seller.settings.update'), [
        'name' => 'Toko Bintang Lima', // Collision with existing store
        'city' => 'Kota Medan',
        'postal_code' => '20111',
        'origin_address' => 'Jl. Putri Hijau No. 12, Medan',
    ]);

    $response->assertSessionHasErrors('name');
});
