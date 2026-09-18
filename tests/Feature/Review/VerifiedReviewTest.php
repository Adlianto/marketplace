<?php

use App\Models\Address;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Helper to build sub order fixture with a specific buyer and status.
 *
 * @return array{
 *   buyer: User,
 *   seller: User,
 *   store: Store,
 *   product: Product,
 *   orderGroup: OrderGroup,
 *   subOrder: SubOrder,
 *   item: SubOrderItem
 * }
 */
function createReviewOrderFixture(string $status = 'completed', ?User $buyer = null): array
{
    $buyer = $buyer ?? User::factory()->create();
    $address = Address::factory()->create(['user_id' => $buyer->id]);

    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);

    $product = Product::factory()->create(['store_id' => $store->id]);
    $sku = ProductSku::factory()->create([
        'product_id' => $product->id,
        'stock' => 50,
        'price' => 150000.00,
    ]);

    $orderGroup = OrderGroup::create([
        'user_id' => $buyer->id,
        'group_code' => 'OG-REV-'.strtoupper(bin2hex(random_bytes(4))),
        'total_amount' => 160000.00,
        'payment_status' => 'paid',
    ]);

    $subOrder = SubOrder::create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'sub_order_number' => 'SUB-REV-'.strtoupper(bin2hex(random_bytes(4))),
        'courier_name' => 'jne',
        'courier_service' => 'REG',
        'items_subtotal' => 150000.00,
        'shipping_cost' => 10000.00,
        'total_amount' => 160000.00,
        'status' => $status,
        'completed_at' => $status === 'completed' ? now() : null,
    ]);

    $item = SubOrderItem::create([
        'sub_order_id' => $subOrder->id,
        'product_id' => $product->id,
        'product_sku_id' => $sku->id,
        'product_title' => $product->title,
        'sku_combination' => 'Default-SKU',
        'price' => 150000.00,
        'quantity' => 1,
        'total_price' => 150000.00,
        'weight_gram' => 500,
    ]);

    return compact('buyer', 'seller', 'store', 'product', 'orderGroup', 'subOrder', 'item');
}

test('buyer with completed order item can submit review with photo attachments', function () {
    Storage::fake('public');

    $fixture = createReviewOrderFixture(status: 'completed');
    $buyer = $fixture['buyer'];
    $product = $fixture['product'];
    $item = $fixture['item'];

    $photo1 = UploadedFile::fake()->image('review1.jpg', 600, 600);
    $photo2 = UploadedFile::fake()->image('review2.png', 800, 800);

    $response = $this->actingAs($buyer)->post(route('reviews.store'), [
        'sub_order_item_id' => $item->id,
        'rating' => 5,
        'review' => 'Produk sangat memuaskan, original dan pengiriman cepat sekali!',
        'photos' => [$photo1, $photo2],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $review = ProductReview::where('sub_order_item_id', $item->id)->first();
    expect($review)->not->toBeNull()
        ->and($review->user_id)->toBe($buyer->id)
        ->and($review->product_id)->toBe($product->id)
        ->and($review->rating)->toBe(5)
        ->and($review->review)->toBe('Produk sangat memuaskan, original dan pengiriman cepat sekali!')
        ->and($review->photos)->toBeArray()->toHaveCount(2)
        ->and($review->isVerifiedPurchase())->toBeTrue();

    // Verify photos were stored on public disk
    foreach ($review->photos as $photoUrl) {
        $storagePath = str_replace('/storage/', '', $photoUrl);
        Storage::disk('public')->assertExists($storagePath);
    }
});

test('buyer who did not purchase the item is rejected with 403 forbidden', function () {
    $fixture = createReviewOrderFixture(status: 'completed');
    $item = $fixture['item'];

    // Another buyer who did not buy this item
    $unrelatedBuyer = User::factory()->create();

    $response = $this->actingAs($unrelatedBuyer)->post(route('reviews.store'), [
        'sub_order_item_id' => $item->id,
        'rating' => 4,
        'review' => 'Mencoba mengulas barang yang tidak pernah saya beli sama sekali.',
    ]);

    $response->assertForbidden();

    expect(ProductReview::where('sub_order_item_id', $item->id)->exists())->toBeFalse();
});

test('buyer cannot review item if order is not completed yet', function (string $incompleteStatus) {
    $fixture = createReviewOrderFixture(status: $incompleteStatus);
    $buyer = $fixture['buyer'];
    $item = $fixture['item'];

    $response = $this->actingAs($buyer)->post(route('reviews.store'), [
        'sub_order_item_id' => $item->id,
        'rating' => 5,
        'review' => 'Mencoba mengulas sebelum barang selesai dikonfirmasi sampai.',
    ]);

    $response->assertForbidden();

    expect(ProductReview::where('sub_order_item_id', $item->id)->exists())->toBeFalse();
})->with(['waiting_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']);

test('duplicate review for the same sub order item is rejected', function () {
    $fixture = createReviewOrderFixture(status: 'completed');
    $buyer = $fixture['buyer'];
    $item = $fixture['item'];

    // First review succeeds
    $responseFirst = $this->actingAs($buyer)->post(route('reviews.store'), [
        'sub_order_item_id' => $item->id,
        'rating' => 5,
        'review' => 'Ulasan pertama kali yang valid dan berhasil tersimpan.',
    ]);
    $responseFirst->assertRedirect();
    expect(ProductReview::where('sub_order_item_id', $item->id)->count())->toBe(1);

    // Second review attempt for the same sub_order_item_id must be rejected (403 or 422)
    $responseSecond = $this->actingAs($buyer)->post(route('reviews.store'), [
        'sub_order_item_id' => $item->id,
        'rating' => 4,
        'review' => 'Percobaan mengulas kedua kalinya untuk item yang sama.',
    ]);

    expect(in_array($responseSecond->status(), [403, 422]))->toBeTrue();
    expect(ProductReview::where('sub_order_item_id', $item->id)->count())->toBe(1);
});

test('review validation requires minimum 10 chars and valid rating', function () {
    $fixture = createReviewOrderFixture(status: 'completed');
    $buyer = $fixture['buyer'];
    $item = $fixture['item'];

    $response = $this->actingAs($buyer)->post(route('reviews.store'), [
        'sub_order_item_id' => $item->id,
        'rating' => 6, // Invalid > 5
        'review' => 'Pendek', // Invalid < 10 chars
    ]);

    $response->assertSessionHasErrors(['rating', 'review']);
});
