<?php

namespace App\Actions\Dispute;

use App\Actions\Wallet\ReleaseEscrowToStoreWalletAction;
use App\Enums\SubOrderStatus;
use App\Models\DisputeTicket;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\SubOrder;
use App\Services\Order\SubOrderStateMachine;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ResolveDisputeAction
{
    public function __construct(
        private readonly SubOrderStateMachine $stateMachine,
        private readonly ReleaseEscrowToStoreWalletAction $releaseEscrowAction,
    ) {}

    /**
     * Resolve an active dispute ticket.
     *
     * @param  string  $solution  'resolved_completed' | 'resolved_refund'
     */
    public function execute(DisputeTicket $disputeTicket, string $solution): DisputeTicket
    {
        if (! in_array($solution, ['resolved_completed', 'resolved_refund'], true)) {
            throw new InvalidArgumentException("Solusi komplain tidak valid: {$solution}");
        }

        return DB::transaction(function () use ($disputeTicket, $solution): DisputeTicket {
            /** @var SubOrder $subOrder */
            $subOrder = SubOrder::with('items')->where('id', $disputeTicket->sub_order_id)->lockForUpdate()->firstOrFail();

            if ($solution === 'resolved_completed') {
                // 1. Transition to completed via FSM
                $this->stateMachine->transitionTo($subOrder, SubOrderStatus::Completed);

                // 2. Release escrow funds to seller's wallet
                $this->releaseEscrowAction->execute($subOrder);

                $disputeTicket->update([
                    'status' => 'resolved_completed',
                    'solution' => 'Pesanan dinyatakan selesai dan dana escrow dicairkan ke penjual.',
                ]);
            } elseif ($solution === 'resolved_refund') {
                // 1. Transition to cancelled via FSM
                $this->stateMachine->transitionTo($subOrder, SubOrderStatus::Cancelled);

                // 2. Atomically restock physical SKU inventory
                foreach ($subOrder->items as $item) {
                    if ($item->product_sku_id) {
                        ProductSku::where('id', $item->product_sku_id)->increment('stock', $item->quantity);
                    } elseif ($item->product_id) {
                        Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    }
                }

                $disputeTicket->update([
                    'status' => 'resolved_refund',
                    'solution' => 'Komplain disetujui, dana dikembalikan ke pembeli dan stok barang dipulihkan.',
                ]);
            }

            return $disputeTicket->fresh(['subOrder', 'user', 'store']);
        });
    }
}
