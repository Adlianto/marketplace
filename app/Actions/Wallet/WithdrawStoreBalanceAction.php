<?php

namespace App\Actions\Wallet;

use App\Exceptions\InsufficientBalanceException;
use App\Models\Store;
use App\Models\StoreWallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class WithdrawStoreBalanceAction
{
    /**
     * Withdraw balance from a store wallet.
     *
     * @throws InsufficientBalanceException
     * @throws InvalidArgumentException
     */
    public function execute(Store $store, float|int|string $amount, ?string $description = null): WalletTransaction
    {
        $withdrawAmount = (float) $amount;

        if ($withdrawAmount <= 0) {
            throw new InvalidArgumentException('Nominal penarikan harus lebih besar dari 0.');
        }

        return DB::transaction(function () use ($store, $withdrawAmount, $description): WalletTransaction {
            StoreWallet::firstOrCreate(
                ['store_id' => $store->id],
                ['balance' => 0.00]
            );

            /** @var StoreWallet $wallet */
            $wallet = StoreWallet::where('store_id', $store->id)->lockForUpdate()->firstOrFail();

            if ((float) $wallet->balance < $withdrawAmount) {
                throw new InsufficientBalanceException('Saldo toko tidak mencukupi untuk melakukan penarikan.');
            }

            $wallet->decrement('balance', $withdrawAmount);

            return WalletTransaction::create([
                'store_wallet_id' => $wallet->id,
                'sub_order_id' => null,
                'type' => 'debit',
                'amount' => $withdrawAmount,
                'description' => $description ?? 'Penarikan saldo toko sebesar Rp '.number_format($withdrawAmount, 0, ',', '.'),
            ]);
        });
    }
}
