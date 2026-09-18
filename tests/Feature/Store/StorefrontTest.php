<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;

test('guest can access public storefront of an active store', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $user->id,
        'name' => 'Toko Gadget Murah',
        'slug' => 'toko-gadget-murah',
        'status' => 'active',
        'is_official' => true,
        'city' => 'Kota Surabaya',
    ]);

    $category = Category::factory()->create(['name' => 'Elektronik']);

    Product::factory()->count(4)->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
        'rating' => 4.9,
    ]);

    $response = $this->get(route('store.show', 'toko-gadget-murah'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('store/show')
        ->where('store.id', $store->id)
        ->where('store.name', 'Toko Gadget Murah')
        ->where('store.is_official', true)
        ->where('stats.total_products', 4)
        ->where('stats.rating_avg', 4.9)
        ->has('products.data', 4)
    );
});

test('authenticated buyer can also view public storefront', function () {
    $buyer = User::factory()->create();
    $store = Store::factory()->create([
        'name' => 'Toko Buku Nusantara',
        'slug' => 'toko-buku-nusantara',
        'status' => 'active',
    ]);

    $response = $this->actingAs($buyer)->get(route('store.show', 'toko-buku-nusantara'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('store/show')
        ->where('store.slug', 'toko-buku-nusantara')
    );
});

test('storefront paginates product catalog with 16 items per page', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create([
        'user_id' => $seller->id,
        'slug' => 'toko-banyak-produk',
        'status' => 'active',
    ]);

    $category = Category::factory()->create();

    Product::factory()->count(20)->create([
        'store_id' => $store->id,
        'category_id' => $category->id,
    ]);

    $response = $this->get(route('store.show', 'toko-banyak-produk'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('store.slug', 'toko-banyak-produk')
        ->has('products.data', 16)
        ->where('products.total', 20)
        ->where('products.per_page', 16)
        ->where('products.current_page', 1)
        ->where('products.last_page', 2)
    );
});

test('storefront returns 404 if store slug does not exist', function () {
    $response = $this->get(route('store.show', 'toko-tidak-ada-di-dunia'));

    $response->assertNotFound();
});

test('storefront returns 404 if store is not active (e.g. suspended or vacation)', function () {
    $user = User::factory()->create();

    Store::factory()->create([
        'user_id' => $user->id,
        'slug' => 'toko-non-aktif',
        'status' => 'suspended',
    ]);

    $response = $this->get(route('store.show', 'toko-non-aktif'));

    $response->assertNotFound();
});

test('storefront only displays products belonging to that specific store', function () {
    $userA = User::factory()->create();
    $storeA = Store::factory()->create(['user_id' => $userA->id, 'slug' => 'toko-a', 'status' => 'active']);

    $userB = User::factory()->create();
    $storeB = Store::factory()->create(['user_id' => $userB->id, 'slug' => 'toko-b', 'status' => 'active']);

    $productA = Product::factory()->create(['store_id' => $storeA->id, 'title' => 'Produk Toko A']);
    $productB = Product::factory()->create(['store_id' => $storeB->id, 'title' => 'Produk Toko B']);

    $response = $this->get(route('store.show', 'toko-a'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('store.slug', 'toko-a')
        ->has('products.data', 1)
        ->where('products.data.0.id', $productA->id)
        ->where('products.data.0.title', 'Produk Toko A')
    );
});
