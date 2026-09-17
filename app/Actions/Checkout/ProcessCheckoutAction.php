<?php

namespace App\Actions\Checkout;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProcessCheckoutAction
{
    /**
     * Eksekusi transaksi checkout dengan pessimistic locking dan validasi atomik.
     *
     * @throws ValidationException
     */
    public function execute(User $user, int $addressId, string $paymentMethod, ?string $notes = null): Order
    {
        return DB::transaction(function () use ($user, $addressId, $paymentMethod, $notes): Order {
            // 1. Validasi kepemilikan alamat pengiriman
            /** @var Address $address */
            $address = Address::where('id', $addressId)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // 2. Ambil seluruh cart yang terpilih milik user
            $selectedCarts = Cart::with('product')
                ->where('user_id', $user->id)
                ->where('selected', true)
                ->get();

            if ($selectedCarts->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Keranjang belanja kosong atau belum ada barang yang dipilih.',
                ]);
            }

            $subtotal = 0;
            $itemsData = [];

            // 3. Pessimistic Locking & Validasi Stok Produk
            foreach ($selectedCarts as $cartItem) {
                /** @var Product $product */
                $product = Product::where('id', $cartItem->product_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $currentStock = $product->stock ?? 0;
                if ($currentStock < $cartItem->quantity) {
                    throw ValidationException::withMessages([
                        'stock' => "Stok produk '{$product->title}' tidak mencukupi (tersisa {$currentStock}).",
                    ]);
                }

                // Kurangi stok produk secara atomik
                $product->decrement('stock', $cartItem->quantity);

                $itemPrice = (int) $product->price;
                $itemSubtotal = $itemPrice * $cartItem->quantity;
                $subtotal += $itemSubtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $cartItem->quantity,
                    'price' => $itemPrice,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $shippingCost = 15000;
            $grandTotal = $subtotal + $shippingCost;

            // 4. Buat Order baru
            /** @var Order $order */
            $order = Order::create([
                'order_number' => 'ORD-'.strtoupper(Str::random(10)),
                'user_id' => $user->id,
                'address_id' => $address->id,
                'total_price' => $subtotal,
                'shipping_cost' => $shippingCost,
                'grand_total' => $grandTotal,
                'status' => 'pending',
                'notes' => $notes,
            ]);

            // 5. Buat Order Items
            foreach ($itemsData as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['subtotal'],
                ]);
            }

            // 6. Buat Catatan Transaksi Pembayaran
            Transaction::create([
                'order_id' => $order->id,
                'payment_method' => $paymentMethod,
                'payment_status' => 'pending',
                'transaction_code' => 'TRX-'.strtoupper(Str::random(12)),
                'paid_at' => null,
            ]);

            // 7. Hapus item cart yang telah dicheckout
            Cart::where('user_id', $user->id)
                ->where('selected', true)
                ->delete();

            return $order;
        });
    }
}
