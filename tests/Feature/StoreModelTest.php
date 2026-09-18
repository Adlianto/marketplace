<?php

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\QueryException;

test('user can have one store and hasStore returns correct status', function () {
    $user = User::factory()->create();

    expect($user->hasStore())->toBeFalse();
    expect($user->store)->toBeNull();

    $store = Store::factory()->create([
        'user_id' => $user->id,
        'name' => 'Toko Barokah',
        'slug' => 'toko-barokah',
    ]);

    // Unloaded relation
    $user->unsetRelation('store');
    expect($user->hasStore())->toBeTrue();
    expect($user->store->id)->toBe($store->id);
    expect($user->store->name)->toBe('Toko Barokah');

    // Eager-loaded relation
    $userWithStore = User::with('store')->find($user->id);
    expect($userWithStore->hasStore())->toBeTrue();
    expect($userWithStore->store->id)->toBe($store->id);
});

test('store belongs to a user', function () {
    $user = User::factory()->create(['name' => 'Juragan Toko']);
    $store = Store::factory()->create(['user_id' => $user->id]);

    expect($store->user)->toBeInstanceOf(User::class);
    expect($store->user->id)->toBe($user->id);
    expect($store->user->name)->toBe('Juragan Toko');
});

test('store has many products and product belongs to store', function () {
    $store = Store::factory()->create();
    $product1 = Product::factory()->create([
        'store_id' => $store->id,
        'title' => 'Produk A',
    ]);
    $product2 = Product::factory()->create([
        'store_id' => $store->id,
        'title' => 'Produk B',
    ]);

    expect($store->products)->toHaveCount(2);
    expect($product1->store->id)->toBe($store->id);
    expect($product2->store->id)->toBe($store->id);
});

test('user cannot have multiple stores (unique user_id constraint)', function () {
    $user = User::factory()->create();

    Store::factory()->create([
        'user_id' => $user->id,
        'slug' => 'toko-pertama',
    ]);

    expect(function () use ($user) {
        Store::factory()->create([
            'user_id' => $user->id,
            'slug' => 'toko-kedua',
        ]);
    })->toThrow(QueryException::class);
});

test('store slug must be unique', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    Store::factory()->create([
        'user_id' => $user1->id,
        'slug' => 'toko-unik',
    ]);

    expect(function () use ($user2) {
        Store::factory()->create([
            'user_id' => $user2->id,
            'slug' => 'toko-unik',
        ]);
    })->toThrow(QueryException::class);
});

test('deleting user cascades and deletes their store', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $user->id]);

    expect(Store::where('id', $store->id)->exists())->toBeTrue();

    $user->delete();

    expect(Store::where('id', $store->id)->exists())->toBeFalse();
});
