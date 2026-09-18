<?php

namespace App\Console\Commands;

use App\Actions\Wallet\ReleaseEscrowToStoreWalletAction;
use App\Enums\SubOrderStatus;
use App\Models\SubOrder;
use App\Services\Order\SubOrderStateMachine;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoCompleteDeliveredOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:auto-complete-delivered';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Selesaikan pesanan terkirim (delivered) yang telah melewati 48 jam dan cairkan dana escrow ke dompet toko';

    /**
     * Execute the console command.
     */
    public function handle(
        SubOrderStateMachine $stateMachine,
        ReleaseEscrowToStoreWalletAction $releaseEscrowAction,
    ): int {
        $cutoffTime = now()->subHours(48);

        $deliveredOrders = SubOrder::with('store')
            ->where('status', SubOrderStatus::Delivered->value)
            ->whereNotNull('delivered_at')
            ->where('delivered_at', '<=', $cutoffTime)
            ->get();

        $processedCount = 0;

        foreach ($deliveredOrders as $subOrder) {
            DB::transaction(function () use ($subOrder, $stateMachine, $releaseEscrowAction) {
                // 1. Transition status to completed via FSM
                $stateMachine->transitionTo($subOrder, SubOrderStatus::Completed);

                // 2. Release escrow balance to seller's wallet
                $releaseEscrowAction->execute($subOrder);
            });

            $processedCount++;
        }

        $this->info("Berhasil menyelesaikan {$processedCount} pesanan terkirim dan mencairkan escrow.");

        return Command::SUCCESS;
    }
}
