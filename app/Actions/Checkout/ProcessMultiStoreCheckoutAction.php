<?php

namespace App\Actions\Checkout;

use App\Actions\Shipping\CalculateStoreShippingAction;
use App\Exceptions\InsufficientStockException;
use App\Models\Cart;
use App\Models\OrderGroup;
use App\Models\ProductSku;
use App\Models\SubOrder;
use App\Models\SubOrderItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * ProcessMultiStoreCheckoutAction
 *
 * Membungkus seluruh alur checkout multi-vendor dalam satu transaksi atomik:
 *  1. Kunci baris SKU secara pesimis (lockForUpdate)
 *  2. Validasi & potong stok
 *  3. Hitung ongkos kirim per toko via CalculateStoreShippingAction
 *  4. Buat 1 OrderGroup + N SubOrder + SubOrderItems
 *  5. Bersihkan item keranjang yang telah dicheckout
 *
 * @param  array{
 *   address_id: int,
 *   stores: array<int, array{store_id: int, courier_name: string, courier_service: string}>
 * }  $payload
 */
class ProcessMultiStoreCheckoutAction
{
    public function __construct(
        protected CalculateStoreShippingAction $shippingAction
    ) {}

    /**
     * Eksekusi checkout multi-toko dengan pessimistic locking.
     *
     * @param  array{
     *   address_id: int,
     *   stores: array<int, array{store_id: int, courier_name: string, courier_service: string}>
     * }  $payload
     *
     * @throws InsufficientStockException Jika stok SKU tidak mencukupi
     * @throws InvalidArgumentException Jika kurir/layanan tidak dikenal
     */
    public function execute(User $user, array $payload): OrderGroup
    {
        return DB::transaction(function () use ($user, $payload): OrderGroup {
            $addressId = (int) $payload['address_id'];

            // ------------------------------------------------------------------
            // 1. Ambil cart item terpilih milik user (eager load SKU & produk)
            // ------------------------------------------------------------------
            /** @var Collection<int, Cart> $cartItems */
            $cartItems = Cart::with(['sku', 'product.store'])
                ->where('user_id', $user->id)
                ->where('selected', true)
                ->get();

            if ($cartItems->isEmpty()) {
                throw new \RuntimeException('Keranjang belanja kosong atau tidak ada item yang dipilih.');
            }

            // ------------------------------------------------------------------
            // 2. Kunci setiap baris SKU secara pesimis, validasi & potong stok
            // ------------------------------------------------------------------
            foreach ($cartItems as $item) {
                /** @var ProductSku $sku */
                $sku = ProductSku::where('id', $item->product_sku_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($sku->stock < $item->quantity) {
                    throw new InsufficientStockException(
                        "Stok SKU {$sku->sku_code} tidak mencukupi. ".
                        "Tersedia: {$sku->stock}, diminta: {$item->quantity}."
                    );
                }

                $sku->decrement('stock', $item->quantity);
            }

            // ------------------------------------------------------------------
            // 3. Kelompokkan cart items berdasarkan store_id
            // ------------------------------------------------------------------
            /** @var array<int, Collection<int, Cart>> $groupedByStore */
            $groupedByStore = $cartItems->groupBy(fn (Cart $c) => (int) ($c->product->store_id ?? 0));

            // Buat lookup: store_id → courier info (dari payload)
            /** @var array<int, array{courier_name: string, courier_service: string}> $courierMap */
            $courierMap = [];
            foreach ((array) ($payload['stores'] ?? []) as $storePayload) {
                $courierMap[(int) $storePayload['store_id']] = [
                    'courier_name' => (string) $storePayload['courier_name'],
                    'courier_service' => (string) $storePayload['courier_service'],
                ];
            }

            // ------------------------------------------------------------------
            // 4. Hitung grand total (subtotal produk + ongkir semua toko)
            // ------------------------------------------------------------------
            $grandTotal = 0;
            /** @var array<int, array{items_subtotal: int, shipping_cost: int, shipping_info: array<string, mixed>}> $storeFinancials */
            $storeFinancials = [];

            foreach ($groupedByStore as $storeId => $items) {
                $itemsSubtotal = $items->sum(fn (Cart $c) => (int) ($c->sku?->price ?? $c->product->price) * $c->quantity);

                $shippingItems = $items->map(fn (Cart $c) => [
                    'weight_gram' => $c->sku?->weight_gram ?? (int) config('shipping.default_weight_gram', 200),
                    'quantity' => $c->quantity,
                ])->values()->toArray();

                $courier = $courierMap[$storeId] ?? ['courier_name' => 'jne', 'courier_service' => 'REG'];
                $shippingInfo = $this->shippingAction->execute(
                    $shippingItems,
                    $courier['courier_name'],
                    $courier['courier_service'],
                );

                $storeFinancials[$storeId] = [
                    'items_subtotal' => $itemsSubtotal,
                    'shipping_cost' => $shippingInfo['cost'],
                    'shipping_info' => $shippingInfo,
                ];

                $grandTotal += $itemsSubtotal + $shippingInfo['cost'];
            }

            // ------------------------------------------------------------------
            // 5. Buat parent OrderGroup
            // ------------------------------------------------------------------
            /** @var OrderGroup $orderGroup */
            $orderGroup = OrderGroup::create([
                'group_code' => 'OG-'.strtoupper(Str::random(10)),
                'user_id' => $user->id,
                'total_amount' => $grandTotal,
                'payment_status' => 'pending',
            ]);

            // ------------------------------------------------------------------
            // 6. Buat SubOrder per toko beserta SubOrderItems
            // ------------------------------------------------------------------
            foreach ($groupedByStore as $storeId => $items) {
                $financials = $storeFinancials[$storeId];
                $courier = $courierMap[$storeId] ?? ['courier_name' => 'jne', 'courier_service' => 'REG'];
                $subTotal = $financials['items_subtotal'] + $financials['shipping_cost'];

                /** @var SubOrder $subOrder */
                $subOrder = SubOrder::create([
                    'order_group_id' => $orderGroup->id,
                    'store_id' => $storeId,
                    'user_id' => $user->id,
                    'address_id' => $addressId,
                    'sub_order_number' => 'SO-'.strtoupper(Str::random(10)),
                    'courier_name' => $courier['courier_name'],
                    'courier_service' => $courier['courier_service'],
                    'items_subtotal' => $financials['items_subtotal'],
                    'shipping_cost' => $financials['shipping_cost'],
                    'total_amount' => $subTotal,
                    'status' => 'pending',
                ]);

                foreach ($items as $cartItem) {
                    $sku = $cartItem->sku;
                    $price = (int) ($sku?->price ?? $cartItem->product->price);

                    SubOrderItem::create([
                        'sub_order_id' => $subOrder->id,
                        'product_id' => $cartItem->product_id,
                        'product_sku_id' => $cartItem->product_sku_id,
                        'product_title' => $cartItem->product->title,
                        'sku_combination' => $sku?->combination_key,
                        'price' => $price,
                        'quantity' => $cartItem->quantity,
                        'total_price' => $price * $cartItem->quantity,
                        'weight_gram' => $sku?->weight_gram ?? (int) config('shipping.default_weight_gram', 200),
                    ]);
                }
            }

            // ------------------------------------------------------------------
            // 7. Bersihkan cart item yang berhasil dicheckout
            // ------------------------------------------------------------------
            Cart::where('user_id', $user->id)
                ->where('selected', true)
                ->delete();

            return $orderGroup;
        });
    }
}
