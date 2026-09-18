<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\SubOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MidtransWebhookController extends Controller
{
    /**
     * Tangani notifikasi HTTP webhook dari Midtrans Snap Sandbox / Production.
     */
    public function handle(Request $request): JsonResponse
    {
        $orderId = (string) $request->input('order_id');
        $statusCode = (string) $request->input('status_code');
        $grossAmount = (string) $request->input('gross_amount');
        $serverKey = (string) config('midtrans.server_key');
        $signatureKey = (string) $request->input('signature_key');

        // 1. Verifikasi tanda tangan digital SHA-512 (Anti-Spoofing)
        if ($orderId === '' || $statusCode === '' || $grossAmount === '' || $signatureKey === '') {
            return response()->json([
                'success' => false,
                'message' => 'Parameter notifikasi Midtrans tidak lengkap.',
            ], 403);
        }

        $expectedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);
        if (! hash_equals($expectedSignature, $signatureKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Tanda tangan digital signature key tidak valid.',
            ], 403);
        }

        // 2. Eksekusi transisi status idempoten dalam transaksi database
        return DB::transaction(function () use ($request, $orderId): JsonResponse {
            /** @var OrderGroup|null $orderGroup */
            $orderGroup = OrderGroup::with(['subOrders.items'])
                ->where('group_code', $orderId)
                ->lockForUpdate()
                ->first();

            if (! $orderGroup) {
                return response()->json([
                    'success' => false,
                    'message' => "OrderGroup dengan kode {$orderId} tidak ditemukan.",
                ], 404);
            }

            $transactionStatus = (string) $request->input('transaction_status');
            $fraudStatus = (string) $request->input('fraud_status', '');

            // IDEMPOTENCY CHECK:
            // Jika sudah berstatus 'paid', hindari pemrosesan ganda
            if ($orderGroup->payment_status === 'paid' && in_array($transactionStatus, ['settlement', 'capture'])) {
                return response()->json([
                    'success' => true,
                    'message' => 'Notifikasi idempoten: Pesanan telah berstatus lunas.',
                ], 200);
            }

            // Jika sudah berstatus 'cancelled', hindari restock ganda
            if ($orderGroup->payment_status === 'cancelled' && in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                return response()->json([
                    'success' => true,
                    'message' => 'Notifikasi idempoten: Pesanan telah dibatalkan sebelumnya.',
                ], 200);
            }

            // A. Penanganan Pembayaran Berhasil: 'settlement' atau 'capture' (dengan fraud_status accept)
            if ($transactionStatus === 'settlement' || ($transactionStatus === 'capture' && $fraudStatus === 'accept')) {
                $orderGroup->update(['payment_status' => 'paid']);

                SubOrder::where('order_group_id', $orderGroup->id)
                    ->update(['status' => 'paid']);

                return response()->json([
                    'success' => true,
                    'message' => 'Status pembayaran berhasil diperbarui menjadi paid.',
                ], 200);
            }

            // B. Penanganan Pembayaran Gagal / Dibatalkan / Kadaluarsa: 'cancel', 'deny', 'expire'
            if (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                $orderGroup->update(['payment_status' => 'cancelled']);

                SubOrder::where('order_group_id', $orderGroup->id)
                    ->update(['status' => 'cancelled']);

                // Kembalikan stok fisik seluruh SKU secara atomik
                foreach ($orderGroup->subOrders as $subOrder) {
                    foreach ($subOrder->items as $item) {
                        if ($item->product_sku_id) {
                            ProductSku::where('id', $item->product_sku_id)->increment('stock', $item->quantity);
                        } elseif ($item->product_id) {
                            Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                        }
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Pesanan dibatalkan dan stok SKU berhasil direstorasi.',
                ], 200);
            }

            // C. Status lainnya (misal: 'pending')
            return response()->json([
                'success' => true,
                'message' => "Notifikasi berstatus {$transactionStatus} berhasil dicatat.",
            ], 200);
        });
    }
}
