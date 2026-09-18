<?php

use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('user can update their own cart item', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $cart = Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'selected' => true,
    ]);

    $response = $this->actingAs($user)->patch(route('cart.update', $cart->id), [
        'quantity' => 3,
        'selected' => false,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $cart->refresh();
    expect($cart->quantity)->toBe(3);
    expect($cart->selected)->toBeFalse();
});

test('user cannot update another user cart item (SEC-03 anti-IDOR update)', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $product = Product::factory()->create();

    $cartB = Cart::factory()->create([
        'user_id' => $userB->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'selected' => true,
    ]);

    // User A attempts to update User B's cart
    $response = $this->actingAs($userA)->patch(route('cart.update', $cartB->id), [
        'quantity' => 10,
    ]);

    $response->assertForbidden();

    // Verify quantity was not changed
    expect($cartB->fresh()->quantity)->toBe(1);
});

test('user can delete their own cart item', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $cart = Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
    ]);

    $response = $this->actingAs($user)->delete(route('cart.destroy', $cart->id));

    $response->assertRedirect();
    expect(Cart::find($cart->id))->toBeNull();
});

test('user cannot delete another user cart item (SEC-03 anti-IDOR destroy)', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $product = Product::factory()->create();

    $cartB = Cart::factory()->create([
        'user_id' => $userB->id,
        'product_id' => $product->id,
    ]);

    // User A attempts to delete User B's cart
    $response = $this->actingAs($userA)->delete(route('cart.destroy', $cartB->id));

    $response->assertForbidden();

    // Verify cart still exists
    expect(Cart::find($cartB->id))->not->toBeNull();
});

test('quantity update clamps negative or zero value to minimum 1', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $cart = Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $response = $this->actingAs($user)->patch(route('cart.update', $cart->id), [
        'quantity' => -10,
    ]);

    $response->assertRedirect();
    expect($cart->fresh()->quantity)->toBe(1);
});

test('cart groups items by store correctly with subtotal and total weight', function () {
    $user = User::factory()->create();

    $storeA = Store::factory()->create(['name' => 'Toko Komputer Bandung', 'city' => 'Kota Bandung']);
    $storeB = Store::factory()->create(['name' => 'Toko Gadget Jakarta', 'city' => 'Kota Jakarta Selatan']);

    $productA1 = Product::factory()->create([
        'store_id' => $storeA->id,
        'price' => 100000,
    ]);
    $productA2 = Product::factory()->create([
        'store_id' => $storeA->id,
        'price' => 50000,
    ]);
    $productB1 = Product::factory()->create([
        'store_id' => $storeB->id,
        'price' => 200000,
    ]);

    Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $productA1->id,
        'quantity' => 2, // 200,000, 400g
        'selected' => true,
    ]);

    Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $productA2->id,
        'quantity' => 1, // 50,000, 200g
        'selected' => true,
    ]);

    Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $productB1->id,
        'quantity' => 1, // 200,000, 200g
        'selected' => false,
    ]);

    $response = $this->actingAs($user)->get(route('cart.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('product/cart')
        ->has('storeGroups', 2)
        ->where('storeGroups.0.store.name', 'Toko Gadget Jakarta') // latest order
        ->where('storeGroups.0.total_items', 1)
        ->where('storeGroups.0.subtotal', 200000)
        ->where('storeGroups.0.selected_subtotal', 0)
        ->where('storeGroups.0.total_weight_gram', 200)
        ->where('storeGroups.0.selected_weight_gram', 0)
        ->where('storeGroups.1.store.name', 'Toko Komputer Bandung')
        ->where('storeGroups.1.total_items', 2)
        ->where('storeGroups.1.subtotal', 250000)
        ->where('storeGroups.1.selected_subtotal', 250000)
        ->where('storeGroups.1.total_weight_gram', 600)
        ->where('storeGroups.1.selected_weight_gram', 600)
        ->where('storeGroups.1.is_all_selected', true)
    );
});

test('cart grouping respects product sku price and weight_gram', function () {
    $user = User::factory()->create();
    $store = Store::factory()->create();
    $product = Product::factory()->create(['store_id' => $store->id]);

    $sku = ProductSku::factory()->create([
        'product_id' => $product->id,
        'price' => 75000,
        'weight_gram' => 450,
        'combination_key' => 'Hitam-XL',
    ]);

    Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'product_sku_id' => $sku->id,
        'quantity' => 2,
        'selected' => true,
    ]);

    $response = $this->actingAs($user)->get(route('cart.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('product/cart')
        ->has('storeGroups', 1)
        ->where('storeGroups.0.items.0.price', 75000)
        ->where('storeGroups.0.items.0.weight_gram', 450)
        ->where('storeGroups.0.items.0.sku_combination', 'Hitam-XL')
        ->where('storeGroups.0.subtotal', 150000)
        ->where('storeGroups.0.total_weight_gram', 900)
    );
});

test('user can toggle all items within a specific store', function () {
    $user = User::factory()->create();
    $storeA = Store::factory()->create();
    $storeB = Store::factory()->create();

    $productA1 = Product::factory()->create(['store_id' => $storeA->id]);
    $productA2 = Product::factory()->create(['store_id' => $storeA->id]);
    $productB1 = Product::factory()->create(['store_id' => $storeB->id]);

    $cartA1 = Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $productA1->id,
        'selected' => true,
    ]);
    $cartA2 = Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $productA2->id,
        'selected' => true,
    ]);
    $cartB1 = Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $productB1->id,
        'selected' => true,
    ]);

    // Unselect Store A items
    $response = $this->actingAs($user)->post(route('cart.toggleStore'), [
        'store_id' => $storeA->id,
        'selected' => false,
    ]);

    $response->assertRedirect();

    expect($cartA1->fresh()->selected)->toBeFalse();
    expect($cartA2->fresh()->selected)->toBeFalse();
    expect($cartB1->fresh()->selected)->toBeTrue();

    // Re-select Store A items
    $response = $this->actingAs($user)->post(route('cart.toggleStore'), [
        'store_id' => $storeA->id,
        'selected' => true,
    ]);

    $response->assertRedirect();
    expect($cartA1->fresh()->selected)->toBeTrue();
    expect($cartA2->fresh()->selected)->toBeTrue();
    expect($cartB1->fresh()->selected)->toBeTrue();
});

test('user cannot toggle store items of another user (SEC-03 anti-IDOR toggleStore)', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $store = Store::factory()->create();

    $product = Product::factory()->create(['store_id' => $store->id]);

    $cartA = Cart::factory()->create([
        'user_id' => $userA->id,
        'product_id' => $product->id,
        'selected' => true,
    ]);

    $cartB = Cart::factory()->create([
        'user_id' => $userB->id,
        'product_id' => $product->id,
        'selected' => true,
    ]);

    // User A attempts to toggle store items to false
    $response = $this->actingAs($userA)->post(route('cart.toggleStore'), [
        'store_id' => $store->id,
        'selected' => false,
    ]);

    $response->assertRedirect();

    expect($cartA->fresh()->selected)->toBeFalse();
    expect($cartB->fresh()->selected)->toBeTrue(); // User B's cart item untouched
});
