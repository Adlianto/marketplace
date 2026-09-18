<?php

use App\Actions\Dispute\ResolveDisputeAction;
use App\Actions\Wallet\ReleaseEscrowToStoreWalletAction;
use App\Models\Address;
use App\Models\DisputeTicket;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\StoreWallet;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use App\Models\User;
use DomainException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Fixture builder for dispute test orders.
 *
 * @return array{
 *   buyer: User,
 *   seller: User,
 *   store: Store,
 *   sku: ProductSku,
 *   product: Product,
 *   orderGroup: OrderGroup,
 *   subOrder: SubOrder,
 *   item: SubOrderItem
 * }
 */
function createDisputeOrderFixture(string $status = 'delivered', int $skuStock = 10, int $quantity = 2): array
{
    $buyer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $buyer->id]);

    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);

    $product = Product::factory()->create(['store_id' => $store->id]);
    $sku = ProductSku::factory()->create([
        'product_id' => $product->id,
        'stock' => $skuStock,
        'price' => 75000.00,
        'combination_key' => 'Dispute-SKU-'.strtoupper(bin2hex(random_bytes(2))),
    ]);

    $itemsSubtotal = 75000.00 * $quantity;
    $shippingCost = 15000.00;

    $orderGroup = OrderGroup::create([
        'user_id' => $buyer->id,
        'group_code' => 'OG-DISP-'.strtoupper(bin2hex(random_bytes(4))),
        'total_amount' => $itemsSubtotal + $shippingCost + 1000,
        'payment_status' => 'paid',
    ]);

    $subOrder = SubOrder::create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'sub_order_number' => 'SUB-DISP-'.strtoupper(bin2hex(random_bytes(4))),
        'courier_name' => 'jne',
        'courier_service' => 'REG',
        'items_subtotal' => $itemsSubtotal,
        'shipping_cost' => $shippingCost,
        'total_amount' => $itemsSubtotal + $shippingCost,
        'status' => $status,
        'shipped_at' => now()->subDay(),
        'delivered_at' => $status === 'delivered' ? now() : null,
    ]);

    $item = SubOrderItem::create([
        'sub_order_id' => $subOrder->id,
        'product_id' => $product->id,
        'product_sku_id' => $sku->id,
        'product_title' => $product->title,
        'sku_combination' => 'Dispute-SKU',
        'price' => 75000.00,
        'quantity' => $quantity,
        'total_price' => $itemsSubtotal,
        'weight_gram' => 500,
    ]);

    return compact('buyer', 'seller', 'store', 'sku', 'product', 'orderGroup', 'subOrder', 'item');
}

test('buyer can open dispute on delivered order and status changes to complaint', function () {
    Storage::fake('public');

    $fixture = createDisputeOrderFixture(status: 'delivered');
    $buyer = $fixture['buyer'];
    $subOrder = $fixture['subOrder'];
    $store = $fixture['store'];

    $photo1 = UploadedFile::fake()->image('broken_item1.jpg', 800, 800);
    $photo2 = UploadedFile::fake()->image('broken_item2.png', 800, 800);

    $response = $this->actingAs($buyer)->post(route('disputes.store'), [
        'sub_order_id' => $subOrder->id,
        'reason' => 'Barang Rusak / Pecah Saat Diterima',
        'description' => 'Layar produk retak saat unboxing dan kemasan luar penyok parah.',
        'photos' => [$photo1, $photo2],
    ]);

    $disputeTicket = DisputeTicket::where('sub_order_id', $subOrder->id)->first();
    expect($disputeTicket)->not->toBeNull()
        ->and($disputeTicket->user_id)->toBe($buyer->id)
        ->and($disputeTicket->store_id)->toBe($store->id)
        ->and($disputeTicket->reason)->toBe('Barang Rusak / Pecah Saat Diterima')
        ->and($disputeTicket->status)->toBe('open')
        ->and($disputeTicket->evidence_photos)->toBeArray()->toHaveCount(2);

    $response->assertRedirect(route('disputes.show', $disputeTicket->id));
    $response->assertSessionHas('success');

    // Ensure SubOrder status was transitioned to complaint
    expect($subOrder->fresh()->status)->toBe('complaint');

    // Verify stored files
    foreach ($disputeTicket->evidence_photos as $photoUrl) {
        $storagePath = str_replace('/storage/', '', $photoUrl);
        Storage::disk('public')->assertExists($storagePath);
    }
});

test('escrow release is blocked when order is in complaint status', function () {
    $fixture = createDisputeOrderFixture(status: 'delivered');
    $subOrder = $fixture['subOrder'];

    // Transition sub order to complaint
    $subOrder->status = 'complaint';
    $subOrder->save();

    $releaseAction = app(ReleaseEscrowToStoreWalletAction::class);

    // Calling release escrow must throw DomainException
    expect(fn () => $releaseAction->execute($subOrder))
        ->toThrow(DomainException::class, "Pencairan dana escrow gagal: Pesanan #{$subOrder->sub_order_number} belum berstatus 'completed'.");

    // Store wallet remains uncredited (0 balance)
    $wallet = StoreWallet::where('store_id', $subOrder->store_id)->first();
    expect($wallet)->toBeNull();
});

test('resolving dispute with resolved_completed marks order completed and releases escrow', function () {
    Storage::fake('public');

    $fixture = createDisputeOrderFixture(status: 'delivered', quantity: 2);
    $buyer = $fixture['buyer'];
    $subOrder = $fixture['subOrder'];
    $store = $fixture['store'];

    // 1. Open dispute
    $photo = UploadedFile::fake()->image('evidence.jpg');
    $this->actingAs($buyer)->post(route('disputes.store'), [
        'sub_order_id' => $subOrder->id,
        'reason' => 'Barang Tidak Lengkap',
        'description' => 'Ada bagian aksesoris yang kurang dalam boks pengiriman.',
        'photos' => [$photo],
    ]);

    $disputeTicket = DisputeTicket::where('sub_order_id', $subOrder->id)->firstOrFail();
    expect($subOrder->fresh()->status)->toBe('complaint');

    // 2. Resolve with resolved_completed
    $resolveAction = app(ResolveDisputeAction::class);
    $resolvedTicket = $resolveAction->execute($disputeTicket, 'resolved_completed');

    expect($resolvedTicket->status)->toBe('resolved_completed')
        ->and($subOrder->fresh()->status)->toBe('completed')
        ->and($subOrder->fresh()->completed_at)->not->toBeNull();

    // 3. Escrow funds must now be credited: 2 * 75,000 = 150,000.00
    $wallet = StoreWallet::where('store_id', $store->id)->first();
    expect($wallet)->not->toBeNull()
        ->and((float) $wallet->balance)->toBe(150000.00);
});

test('resolving dispute with resolved_refund marks order cancelled and restores physical sku stock', function () {
    Storage::fake('public');

    $fixture = createDisputeOrderFixture(status: 'delivered', skuStock: 10, quantity: 3);
    $buyer = $fixture['buyer'];
    $subOrder = $fixture['subOrder'];
    $sku = $fixture['sku'];

    // 1. Open dispute
    $photo = UploadedFile::fake()->image('wrong_item.jpg');
    $this->actingAs($buyer)->post(route('disputes.store'), [
        'sub_order_id' => $subOrder->id,
        'reason' => 'Salah Kirim Produk / Varian Berbeda',
        'description' => 'Warna dan tipe produk yang dikirim berbeda total dari yang dipesan.',
        'photos' => [$photo],
    ]);

    $disputeTicket = DisputeTicket::where('sub_order_id', $subOrder->id)->firstOrFail();

    // 2. Resolve with resolved_refund
    $resolveAction = app(ResolveDisputeAction::class);
    $resolvedTicket = $resolveAction->execute($disputeTicket, 'resolved_refund');

    expect($resolvedTicket->status)->toBe('resolved_refund')
        ->and($subOrder->fresh()->status)->toBe('cancelled');

    // 3. Restock inventory: initial 10 + 3 returned = 13
    expect($sku->fresh()->stock)->toBe(13);
});

test('unrelated user cannot open dispute on anothers order (anti-idor 403)', function () {
    Storage::fake('public');

    $fixture = createDisputeOrderFixture(status: 'delivered');
    $subOrder = $fixture['subOrder'];

    $unrelatedUser = User::factory()->create();
    $photo = UploadedFile::fake()->image('fake.jpg');

    $response = $this->actingAs($unrelatedUser)->post(route('disputes.store'), [
        'sub_order_id' => $subOrder->id,
        'reason' => 'Barang Rusak',
        'description' => 'Mencoba komplain pesanan orang lain secara ilegal.',
        'photos' => [$photo],
    ]);

    $response->assertForbidden();

    expect(DisputeTicket::where('sub_order_id', $subOrder->id)->exists())->toBeFalse();
});
