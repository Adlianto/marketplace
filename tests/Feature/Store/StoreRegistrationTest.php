<?php

use App\Models\Store;
use App\Models\User;

test('guest is redirected to login when attempting to open a store', function () {
    $response = $this->get(route('store.create'));
    $response->assertRedirect(route('login'));

    $postResponse = $this->post(route('store.store'), [
        'name' => 'Toko Baru',
        'slug' => 'toko-baru',
        'city' => 'Kota Jakarta Selatan',
        'postal_code' => '12190',
        'origin_address' => 'Jl. Jenderal Sudirman Kav. 52-53',
    ]);
    $postResponse->assertRedirect(route('login'));
});

test('authenticated buyer without store can view store creation page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('store.create'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('store/create'));
});

test('buyer with existing store is redirected when visiting store create page', function () {
    $user = User::factory()->create();
    Store::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('store.create'));
    $response->assertRedirect(route('seller.dashboard'));
});

test('buyer can successfully register a new store', function () {
    $user = User::factory()->create();

    $payload = [
        'name' => 'Toko Elektronik Super',
        'slug' => 'toko-elektronik-super',
        'city' => 'Kota Bandung',
        'postal_code' => '40115',
        'origin_address' => 'Jl. Riau No. 123, Cihapit, Bandung Wetan',
        'description' => 'Toko elektronik terlengkap dan bergaransi resmi.',
    ];

    $response = $this->actingAs($user)->post(route('store.store'), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('seller.dashboard'));
    $response->assertSessionHas('success', 'Selamat! Toko Anda berhasil dibuka.');

    $this->assertDatabaseHas('stores', [
        'user_id' => $user->id,
        'name' => 'Toko Elektronik Super',
        'slug' => 'toko-elektronik-super',
        'city' => 'Kota Bandung',
        'postal_code' => '40115',
        'status' => 'active',
        'is_official' => false,
        'power_merchant' => false,
    ]);

    expect($user->fresh()->hasStore())->toBeTrue();
});

test('user who already has a store is denied from creating another store (anti-duplication 403 Forbidden)', function () {
    $user = User::factory()->create();
    Store::factory()->create([
        'user_id' => $user->id,
        'slug' => 'toko-lama',
    ]);

    $payload = [
        'name' => 'Toko Kedua Saya',
        'slug' => 'toko-kedua-saya',
        'city' => 'Kota Surabaya',
        'postal_code' => '60111',
        'origin_address' => 'Jl. Tunjungan No. 45, Genteng, Surabaya',
    ];

    $response = $this->actingAs($user)->post(route('store.store'), $payload);

    $response->assertForbidden();
    expect(Store::where('user_id', $user->id)->count())->toBe(1);
});

test('store registration validates unique slug', function () {
    $existingUser = User::factory()->create();
    Store::factory()->create([
        'user_id' => $existingUser->id,
        'name' => 'Toko Utama',
        'slug' => 'toko-keren',
    ]);

    $newUser = User::factory()->create();
    $payload = [
        'name' => 'Toko Keren Abis',
        'slug' => 'toko-keren', // Duplicate slug
        'city' => 'Kota Medan',
        'postal_code' => '20111',
        'origin_address' => 'Jl. Gatot Subroto No. 88, Medan Petisah',
    ];

    $response = $this->actingAs($newUser)->post(route('store.store'), $payload);

    $response->assertSessionHasErrors('slug');
    $this->assertDatabaseMissing('stores', [
        'user_id' => $newUser->id,
    ]);
});

test('store registration validates required and formatted fields', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('store.store'), [
        'name' => 'ab', // min:3
        'slug' => 'Invalid Slug!', // regex failure
        'city' => '',
        'postal_code' => 'invalid-zip', // regex failure
        'origin_address' => 'pendek', // min:10
    ]);

    $response->assertSessionHasErrors([
        'name',
        'slug',
        'city',
        'postal_code',
        'origin_address',
    ]);
});
