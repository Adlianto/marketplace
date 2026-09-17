<?php

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function setupAddress(User $user, array $attributes = []): Address
{
    return $user->addresses()->create(array_merge([
        'label' => 'Rumah',
        'receiver' => 'Budi Santoso',
        'phone' => '08123456789',
        'full_address' => 'Jl. Jend. Sudirman No. 123, Jakarta',
        'note' => 'Pagar hitam',
        'pinpoint' => 'Jakarta, Indonesia',
        'is_main' => true,
    ], $attributes));
}

test('guest cannot access checkout index or process', function () {
    $this->get(route('checkout.index'))->assertRedirect(route('login'));
    $this->post(route('checkout.process'), [])->assertRedirect(route('login'));
});

test('user with empty cart is redirected to cart page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('checkout.index'));

    $response->assertRedirect(route('cart.index'));
});

test('user can view checkout page when they have selected items in cart', function () {
    $user = User::factory()->create();
    $address = setupAddress($user);
    $product = Product::factory()->create(['price' => 50000, 'stock' => 10]);

    Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'selected' => true,
    ]);

    $response = $this->actingAs($user)->get(route('checkout.index'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('checkout/checkoutPage')
        ->has('items', 1)
        ->has('addresses', 1)
        ->where('summary.subtotal', 100000)
        ->where('summary.shipping_cost', 15000)
        ->where('summary.grand_total', 115000)
    );
});

test('user can successfully checkout with stock decrement and transaction creation', function () {
    $user = User::factory()->create();
    $address = setupAddress($user);
    $productA = Product::factory()->create(['price' => 50000, 'stock' => 10]);
    $productB = Product::factory()->create(['price' => 30000, 'stock' => 5]);

    // Selected cart items
    Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $productA->id,
        'quantity' => 2,
        'selected' => true,
    ]);

    Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $productB->id,
        'quantity' => 1,
        'selected' => true,
    ]);

    // Unselected cart item (should NOT be deleted)
    $unselectedProduct = Product::factory()->create(['price' => 20000, 'stock' => 8]);
    $unselectedCart = Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $unselectedProduct->id,
        'quantity' => 1,
        'selected' => false,
    ]);

    $payload = [
        'address_id' => $address->id,
        'payment_method' => 'qris',
        'notes' => 'Tolong packing kayu yang aman',
    ];

    $response = $this->actingAs($user)->post(route('checkout.process'), $payload);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('dashboard'));

    // Verify stock decrements
    expect($productA->fresh()->stock)->toBe(8);
    expect($productB->fresh()->stock)->toBe(4);
    expect($unselectedProduct->fresh()->stock)->toBe(8);

    // Verify Order created
    $order = Order::where('user_id', $user->id)->first();
    expect($order)->not->toBeNull();
    expect($order->total_price)->toBe(130000);
    expect($order->shipping_cost)->toBe(15000);
    expect($order->grand_total)->toBe(145000);
    expect($order->status)->toBe('pending');
    expect($order->notes)->toBe('Tolong packing kayu yang aman');
    expect($order->order_number)->toStartWith('ORD-');

    // Verify OrderItems created
    expect($order->items)->toHaveCount(2);
    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'product_id' => $productA->id,
        'quantity' => 2,
        'price' => 50000,
        'subtotal' => 100000,
    ]);
    $this->assertDatabaseHas('order_items', [
        'order_id' => $order->id,
        'product_id' => $productB->id,
        'quantity' => 1,
        'price' => 30000,
        'subtotal' => 30000,
    ]);

    // Verify Transaction created
    $this->assertDatabaseHas('transactions', [
        'order_id' => $order->id,
        'payment_method' => 'qris',
        'payment_status' => 'pending',
    ]);

    // Verify selected carts are deleted, unselected remains
    expect(Cart::where('user_id', $user->id)->where('selected', true)->count())->toBe(0);
    expect(Cart::find($unselectedCart->id))->not->toBeNull();
});

test('user cannot checkout using an address owned by another user (anti-IDOR)', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $addressUserB = setupAddress($userB, ['label' => 'Alamat Milik B']);
    $product = Product::factory()->create(['price' => 50000, 'stock' => 10]);

    Cart::factory()->create([
        'user_id' => $userA->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'selected' => true,
    ]);

    $payload = [
        'address_id' => $addressUserB->id,
        'payment_method' => 'qris',
    ];

    $response = $this->actingAs($userA)->post(route('checkout.process'), $payload);

    $response->assertSessionHasErrors('address_id');
    expect(Order::count())->toBe(0);
    expect($product->fresh()->stock)->toBe(10);
});

test('checkout fails and rolls back atomically when product stock is insufficient', function () {
    $user = User::factory()->create();
    $address = setupAddress($user);
    $product = Product::factory()->create(['price' => 50000, 'stock' => 2]);

    Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'quantity' => 5, // Exceeds available stock (2)
        'selected' => true,
    ]);

    $payload = [
        'address_id' => $address->id,
        'payment_method' => 'bca_va',
    ];

    $response = $this->actingAs($user)->post(route('checkout.process'), $payload);

    $response->assertSessionHasErrors('stock');

    // Verify atomic rollback: no orders created, stock unchanged, cart item remains
    expect(Order::count())->toBe(0);
    expect($product->fresh()->stock)->toBe(2);
    expect(Cart::where('user_id', $user->id)->count())->toBe(1);
});

test('checkout fails when notes exceed 500 characters', function () {
    $user = User::factory()->create();
    $address = setupAddress($user);
    $product = Product::factory()->create(['stock' => 10]);

    Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'selected' => true,
    ]);

    $response = $this->actingAs($user)->post(route('checkout.process'), [
        'address_id' => $address->id,
        'payment_method' => 'qris',
        'notes' => str_repeat('A', 501),
    ]);

    $response->assertSessionHasErrors('notes');
    expect(Order::count())->toBe(0);
});

test('checkout fails when payment method is invalid or unsupported', function () {
    $user = User::factory()->create();
    $address = setupAddress($user);
    $product = Product::factory()->create(['stock' => 10]);

    Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'selected' => true,
    ]);

    $response = $this->actingAs($user)->post(route('checkout.process'), [
        'address_id' => $address->id,
        'payment_method' => 'unsupported_bitcoin_fake',
    ]);

    $response->assertSessionHasErrors('payment_method');
    expect(Order::count())->toBe(0);
});

test('consecutive checkout attempt with already emptied cart is rejected', function () {
    $user = User::factory()->create();
    $address = setupAddress($user);
    $product = Product::factory()->create(['stock' => 10]);

    Cart::factory()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'selected' => true,
    ]);

    $payload = [
        'address_id' => $address->id,
        'payment_method' => 'qris',
    ];

    // First checkout succeeds
    $this->actingAs($user)->post(route('checkout.process'), $payload)->assertRedirect(route('dashboard'));

    // Second instant attempt (e.g. back button / double submit) fails because cart was already emptied
    $response = $this->actingAs($user)->post(route('checkout.process'), $payload);
    $response->assertSessionHasErrors('cart');
    expect(Order::where('user_id', $user->id)->count())->toBe(1);
});

test('checkout endpoint is rate limited to 10 requests per minute (CON-01)', function () {
    $user = User::factory()->create();

    // Send 10 requests (invalid payload is fine, middleware triggers first)
    for ($i = 0; $i < 10; $i++) {
        $this->actingAs($user)->post(route('checkout.process'), []);
    }

    // 11th request triggers 429 Too Many Requests
    $response = $this->actingAs($user)->post(route('checkout.process'), []);
    $response->assertStatus(429);
});
