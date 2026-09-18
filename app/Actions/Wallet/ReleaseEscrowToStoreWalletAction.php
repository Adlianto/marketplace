<?php

namespace App\Actions\Wallet;

use App\Models\StoreWallet;
use App\Models\SubOrder;
use App\Models\WalletTransaction;
use DomainException;
use Illuminate\Support\Facades\DB;

class ReleaseEscrowToStoreWalletAction
{
    /**
     * Release escrow payment funds into the seller's store wallet.
     *
     * @throws DomainException
     */
    public function execute(SubOrder $subOrder): WalletTransaction
    {
        if ($subOrder->status !== 'completed') {
            throw new DomainException("Pencairan dana escrow gagal: Pesanan #{$subOrder->sub_order_number} belum berstatus 'completed'.");
        }

        return DB::transaction(function () use ($subOrder): WalletTransaction {
            StoreWallet::firstOrCreate(
                ['store_id' => $subOrder->store_id],
                ['balance' => 0.00]
            );

            /** @var StoreWallet $wallet */
            $wallet = StoreWallet::where('store_id', $subOrder->store_id)->lockForUpdate()->firstOrFail();

            // Idempotency: Prevent double crediting for the same sub_order
            $existing = WalletTransaction::where('store_wallet_id', $wallet->id)
                ->where('sub_order_id', $subOrder->id)
                ->where('type', 'credit')
                ->first();

            if ($existing) {
                return $existing;
            }

            $amount = (float) $subOrder->items_subtotal;

            $wallet->increment('balance', $amount);

            return WalletTransaction::create([
                'store_wallet_id' => $wallet->id,
                'sub_order_id' => $subOrder->id,
                'type' => 'credit',
                'amount' => $amount,
                'description' => "Pencairan dana penjualan pesanan #{$subOrder->sub_order_number}",
            ]);
        });
    }
}
