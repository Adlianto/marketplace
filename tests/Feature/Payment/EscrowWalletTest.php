<?php

use App\Actions\Wallet\ReleaseEscrowToStoreWalletAction;
use App\Actions\Wallet\WithdrawStoreBalanceAction;
use App\Exceptions\InsufficientBalanceException;
use App\Models\Address;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\Store;
use App\Models\StoreWallet;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use App\Models\User;
use App\Models\WalletTransaction;

/**
 * Fixture helper to create a complete SubOrder with Store, Buyer, Product, and SubOrderItem.
 */
function createSubOrderFixture(float $itemsSubtotal = 150000.00, float $shippingCost = 15000.00): array
{
    $buyer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $buyer->id]);

    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);

    $product = Product::factory()->create(['store_id' => $store->id]);
    $sku = ProductSku::factory()->create([
        'product_id' => $product->id,
        'stock' => 10,
        'price' => $itemsSubtotal,
        'combination_key' => 'Default-Item',
    ]);

    $orderGroup = OrderGroup::create([
        'user_id' => $buyer->id,
        'group_code' => 'ORD-TEST-'.strtoupper(bin2hex(random_bytes(4))),
        'total_amount' => $itemsSubtotal + $shippingCost + 1000,
        'payment_status' => 'paid',
    ]);

    $subOrder = SubOrder::create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'sub_order_number' => 'SUB-TEST-'.strtoupper(bin2hex(random_bytes(4))),
        'courier_name' => 'jne',
        'courier_service' => 'REG',
        'items_subtotal' => $itemsSubtotal,
        'shipping_cost' => $shippingCost,
        'total_amount' => $itemsSubtotal + $shippingCost,
        'status' => 'completed',
    ]);

    $subOrderItem = SubOrderItem::create([
        'sub_order_id' => $subOrder->id,
        'product_id' => $product->id,
        'product_sku_id' => $sku->id,
        'product_title' => $product->title ?? 'Product Test',
        'sku_combination' => 'Default-Item',
        'price' => $itemsSubtotal,
        'quantity' => 1,
        'total_price' => $itemsSubtotal,
        'weight_gram' => 500,
    ]);

    return compact('buyer', 'seller', 'store', 'product', 'sku', 'orderGroup', 'subOrder', 'subOrderItem');
}

test('release escrow action credits store wallet balance and records credit transaction', function () {
    $fixture = createSubOrderFixture(250000.00, 20000.00);
    $subOrder = $fixture['subOrder'];
    $store = $fixture['store'];

    $action = app(ReleaseEscrowToStoreWalletAction::class);
    $transaction = $action->execute($subOrder);

    expect($transaction)->toBeInstanceOf(WalletTransaction::class)
        ->and($transaction->type)->toBe('credit')
        ->and((float) $transaction->amount)->toBe(250000.00)
        ->and($transaction->sub_order_id)->toBe($subOrder->id)
        ->and($transaction->description)->toContain($subOrder->sub_order_number);

    $wallet = StoreWallet::where('store_id', $store->id)->first();
    expect($wallet)->not->toBeNull()
        ->and((float) $wallet->balance)->toBe(250000.00);
});

test('release escrow action is idempotent and prevents double crediting for the same sub order', function () {
    $fixture = createSubOrderFixture(180000.00);
    $subOrder = $fixture['subOrder'];
    $store = $fixture['store'];

    $action = app(ReleaseEscrowToStoreWalletAction::class);

    // First call
    $tx1 = $action->execute($subOrder);

    // Second call for the same sub order
    $tx2 = $action->execute($subOrder);

    expect($tx1->id)->toBe($tx2->id);

    $wallet = StoreWallet::where('store_id', $store->id)->first();
    expect((float) $wallet->balance)->toBe(180000.00)
        ->and(WalletTransaction::where('sub_order_id', $subOrder->id)->count())->toBe(1);
});

test('withdraw store balance action decrements balance and records debit transaction', function () {
    $fixture = createSubOrderFixture(500000.00);
    $subOrder = $fixture['subOrder'];
    $store = $fixture['store'];

    $releaseAction = app(ReleaseEscrowToStoreWalletAction::class);
    $releaseAction->execute($subOrder);

    $withdrawAction = app(WithdrawStoreBalanceAction::class);
    $debitTx = $withdrawAction->execute($store, 200000.00, 'Penarikan dana ke rekening BCA');

    expect($debitTx)->toBeInstanceOf(WalletTransaction::class)
        ->and($debitTx->type)->toBe('debit')
        ->and((float) $debitTx->amount)->toBe(200000.00)
        ->and($debitTx->sub_order_id)->toBeNull()
        ->and($debitTx->description)->toBe('Penarikan dana ke rekening BCA');

    $wallet = StoreWallet::where('store_id', $store->id)->first();
    expect((float) $wallet->balance)->toBe(300000.00);
});

test('withdraw store balance action throws exception when balance is insufficient', function () {
    $fixture = createSubOrderFixture(100000.00);
    $subOrder = $fixture['subOrder'];
    $store = $fixture['store'];

    $releaseAction = app(ReleaseEscrowToStoreWalletAction::class);
    $releaseAction->execute($subOrder);

    $withdrawAction = app(WithdrawStoreBalanceAction::class);

    expect(fn () => $withdrawAction->execute($store, 150000.00))
        ->toThrow(InsufficientBalanceException::class, 'Saldo toko tidak mencukupi untuk melakukan penarikan.');

    $wallet = StoreWallet::where('store_id', $store->id)->first();
    expect((float) $wallet->balance)->toBe(100000.00);
});

test('withdraw store balance action rejects non-positive amount', function () {
    $fixture = createSubOrderFixture(100000.00);
    $store = $fixture['store'];

    $withdrawAction = app(WithdrawStoreBalanceAction::class);

    expect(fn () => $withdrawAction->execute($store, 0))
        ->toThrow(InvalidArgumentException::class, 'Nominal penarikan harus lebih besar dari 0.');

    expect(fn () => $withdrawAction->execute($store, -50000))
        ->toThrow(InvalidArgumentException::class, 'Nominal penarikan harus lebih besar dari 0.');
});

test('eloquent relations between store, store_wallet, wallet_transactions, and sub_order are intact', function () {
    $fixture = createSubOrderFixture(300000.00);
    $subOrder = $fixture['subOrder'];
    $store = $fixture['store'];

    $releaseAction = app(ReleaseEscrowToStoreWalletAction::class);
    $creditTx = $releaseAction->execute($subOrder);

    // Refresh store and relationships
    $store->refresh();
    expect($store->wallet)->not->toBeNull()
        ->and($store->wallet->id)->toBe($creditTx->store_wallet_id);

    $wallet = $store->wallet;
    expect($wallet->store->id)->toBe($store->id)
        ->and($wallet->transactions)->toHaveCount(1)
        ->and($wallet->transactions->first()->id)->toBe($creditTx->id);

    expect($creditTx->wallet->id)->toBe($wallet->id)
        ->and($creditTx->storeWallet->id)->toBe($wallet->id)
        ->and($creditTx->subOrder->id)->toBe($subOrder->id);

    $subOrder->refresh();
    expect($subOrder->walletTransactions)->toHaveCount(1)
        ->and($subOrder->walletTransactions->first()->id)->toBe($creditTx->id);
});

test('release escrow action rejects sub order if status is not completed', function (string $invalidStatus) {
    $fixture = createSubOrderFixture(150000.00);
    $subOrder = $fixture['subOrder'];
    $subOrder->update(['status' => $invalidStatus]);
    $store = $fixture['store'];

    $action = app(ReleaseEscrowToStoreWalletAction::class);

    expect(fn () => $action->execute($subOrder))
        ->toThrow(DomainException::class, "Pencairan dana escrow gagal: Pesanan #{$subOrder->sub_order_number} belum berstatus 'completed'.");

    // Wallet balance must not be credited
    $wallet = StoreWallet::where('store_id', $store->id)->first();
    if ($wallet) {
        expect((float) $wallet->balance)->toBe(0.00);
    }
    expect(WalletTransaction::where('sub_order_id', $subOrder->id)->count())->toBe(0);
})->with(['waiting_payment', 'paid', 'processing', 'shipped', 'cancelled']);

test('multiple sub orders from the same store accumulate balance accurately without floating point drift', function () {
    $buyer = User::factory()->create();
    $address = Address::factory()->create(['user_id' => $buyer->id]);
    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);

    $orderGroup = OrderGroup::create([
        'user_id' => $buyer->id,
        'group_code' => 'OG-MULTI-'.strtoupper(bin2hex(random_bytes(4))),
        'total_amount' => 500000.00,
        'payment_status' => 'paid',
    ]);

    // SubOrder 1: 125,500.50
    $subOrder1 = SubOrder::create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'sub_order_number' => 'SUB-MULTI-1',
        'courier_name' => 'jne',
        'courier_service' => 'REG',
        'items_subtotal' => 125500.50,
        'shipping_cost' => 10000.00,
        'total_amount' => 135500.50,
        'status' => 'completed',
    ]);

    // SubOrder 2: 74,499.50
    $subOrder2 = SubOrder::create([
        'order_group_id' => $orderGroup->id,
        'store_id' => $store->id,
        'user_id' => $buyer->id,
        'address_id' => $address->id,
        'sub_order_number' => 'SUB-MULTI-2',
        'courier_name' => 'sicepat',
        'courier_service' => 'SIUNT',
        'items_subtotal' => 74499.50,
        'shipping_cost' => 10000.00,
        'total_amount' => 84499.50,
        'status' => 'completed',
    ]);

    $action = app(ReleaseEscrowToStoreWalletAction::class);
    $tx1 = $action->execute($subOrder1);
    $tx2 = $action->execute($subOrder2);

    expect($tx1->type)->toBe('credit')
        ->and((float) $tx1->amount)->toBe(125500.50)
        ->and($tx2->type)->toBe('credit')
        ->and((float) $tx2->amount)->toBe(74499.50);

    // Exact sum: 125,500.50 + 74,499.50 = 200,000.00
    $wallet = StoreWallet::where('store_id', $store->id)->first();
    expect((float) $wallet->balance)->toBe(200000.00)
        ->and(WalletTransaction::where('store_wallet_id', $wallet->id)->count())->toBe(2);
});

test('withdrawing exact balance zeroes out store wallet', function () {
    $fixture = createSubOrderFixture(150000.00);
    $subOrder = $fixture['subOrder'];
    $store = $fixture['store'];

    app(ReleaseEscrowToStoreWalletAction::class)->execute($subOrder);

    $withdrawAction = app(WithdrawStoreBalanceAction::class);
    $tx = $withdrawAction->execute($store, 150000.00, 'Tarik semua saldo');

    expect((float) $tx->amount)->toBe(150000.00);

    $wallet = StoreWallet::where('store_id', $store->id)->first();
    expect((float) $wallet->balance)->toBe(0.00);
});

test('withdraw from store without existing wallet throws insufficient balance exception', function () {
    $seller = User::factory()->create();
    $store = Store::factory()->create(['user_id' => $seller->id]);

    $withdrawAction = app(WithdrawStoreBalanceAction::class);

    expect(fn () => $withdrawAction->execute($store, 50000.00))
        ->toThrow(InsufficientBalanceException::class, 'Saldo toko tidak mencukupi untuk melakukan penarikan.');
});
