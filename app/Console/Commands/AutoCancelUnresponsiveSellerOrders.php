<?php

namespace App\Console\Commands;

use App\Enums\SubOrderStatus;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\SubOrder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AutoCancelUnresponsiveSellerOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:auto-cancel-unprocessed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Batalkan pesanan lunas yang tidak diproses penjual lebih dari 48 jam dan kembalikan stok fisik SKU';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $cutoffTime = now()->subHours(48);

        $unresponsiveSubOrders = SubOrder::with('items')
            ->where('status', SubOrderStatus::Paid->value)
            ->where('updated_at', '<=', $cutoffTime)
            ->get();

        $processedCount = 0;

        foreach ($unresponsiveSubOrders as $subOrder) {
            DB::transaction(function () use ($subOrder) {
                $subOrder->update([
                    'status' => SubOrderStatus::Cancelled->value,
                ]);

                // Atomically restock each purchased item
                foreach ($subOrder->items as $item) {
                    if ($item->product_sku_id) {
                        ProductSku::where('id', $item->product_sku_id)->increment('stock', $item->quantity);
                    } elseif ($item->product_id) {
                        Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    }
                }
            });

            $processedCount++;
        }

        $this->info("Berhasil membatalkan {$processedCount} pesanan lunas yang tidak diproses penjual.");

        return Command::SUCCESS;
    }
}
