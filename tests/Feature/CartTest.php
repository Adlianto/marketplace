<?php

use App\Models\Cart;
use App\Models\Product;
use App\Models\User;

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
