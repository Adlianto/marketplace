<?php

namespace App\Console\Commands;

use App\Enums\SubOrderStatus;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\SubOrder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoCancelUnpaidOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:auto-cancel-unpaid';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Batalkan pesanan pending yang belum dibayar lebih dari 24 jam dan kembalikan stok fisik SKU';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $cutoffTime = now()->subHours(24);

        $expiredOrders = OrderGroup::with(['subOrders.items'])
            ->where('payment_status', 'pending')
            ->where('created_at', '<=', $cutoffTime)
            ->get();

        $processedCount = 0;

        foreach ($expiredOrders as $orderGroup) {
            DB::transaction(function () use ($orderGroup) {
                $orderGroup->update([
                    'payment_status' => 'expired',
                ]);

                SubOrder::where('order_group_id', $orderGroup->id)
                    ->where('status', SubOrderStatus::WaitingPayment->value)
                    ->update([
                        'status' => SubOrderStatus::Cancelled->value,
                    ]);

                // Atomically restock each purchased item
                foreach ($orderGroup->subOrders as $subOrder) {
                    foreach ($subOrder->items as $item) {
                        if ($item->product_sku_id) {
                            ProductSku::where('id', $item->product_sku_id)->increment('stock', $item->quantity);
                        } elseif ($item->product_id) {
                            Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                        }
                    }
                }
            });

            $processedCount++;
        }

        $this->info("Berhasil membatalkan {$processedCount} pesanan belum dibayar.");

        return Command::SUCCESS;
    }
}
