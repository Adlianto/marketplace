<?php

namespace App\Actions\Payment;

use App\Models\OrderGroup;
use Illuminate\Support\Str;
use Midtrans\Snap;

/**
 * Action untuk menghasilkan Snap Payment Token dari Midtrans berdasarkan OrderGroup.
 */
class CreateMidtransSnapTokenAction
{
    /**
     * @var (callable(array<string, mixed>): string)|null
     */
    protected static $tokenGenerator = null;

    /**
     * @var array<int, array<string, mixed>>
     */
    protected static array $capturedPayloads = [];

    /**
     * Register a fake token generator for testing without external HTTP requests.
     *
     * @param  (callable(array<string, mixed>): string)|null  $generator
     */
    public static function fake(?callable $generator = null): void
    {
        static::$tokenGenerator = $generator ?? fn (array $payload) => 'mock-snap-token-'.Str::random(32);
        static::$capturedPayloads = [];
    }

    /**
     * Reset fake generator.
     */
    public static function tearDownFake(): void
    {
        static::$tokenGenerator = null;
        static::$capturedPayloads = [];
    }

    /**
     * Retrieve captured payloads from fake execution.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function capturedPayloads(): array
    {
        return static::$capturedPayloads;
    }

    /**
     * Eksekusi pembentukan Snap Token untuk OrderGroup dan simpan ke basis data.
     */
    public function execute(OrderGroup $orderGroup): string
    {
        // Pastikan seluruh relasi penting telah dimuat
        $orderGroup->loadMissing([
            'user',
            'subOrders.store',
            'subOrders.items',
            'subOrders.address',
        ]);

        $payload = $this->buildPayload($orderGroup);

        if (static::$tokenGenerator !== null) {
            static::$capturedPayloads[] = $payload;
            $snapToken = (string) (static::$tokenGenerator)($payload);
        } else {
            $snapToken = (string) Snap::getSnapToken($payload);
        }

        $orderGroup->update([
            'snap_token' => $snapToken,
        ]);

        return $snapToken;
    }

    /**
     * Bentuk struktur payload Midtrans Snap.
     *
     * @return array{
     *   transaction_details: array{order_id: string, gross_amount: int},
     *   customer_details: array{first_name: string, email: string, phone: string},
     *   item_details: array<int, array{id: string, price: int, quantity: int, name: string}>
     * }
     */
    public function buildPayload(OrderGroup $orderGroup): array
    {
        $grossAmount = (int) round((float) $orderGroup->total_amount);

        // 1. Customer details
        $phone = $orderGroup->subOrders->first()?->address?->phone
            ?? $orderGroup->user?->phone
            ?? '08123456789';

        $customerDetails = [
            'first_name' => (string) $orderGroup->user->name,
            'email' => (string) $orderGroup->user->email,
            'phone' => (string) $phone,
        ];

        // 2. Item details
        $itemDetails = [];

        foreach ($orderGroup->subOrders as $subOrder) {
            // A. SKU Items
            foreach ($subOrder->items as $item) {
                $name = $item->product_title;
                if ($item->sku_combination) {
                    $name .= " ({$item->sku_combination})";
                }

                $itemDetails[] = [
                    'id' => "ITEM-{$item->id}",
                    'price' => (int) round((float) $item->price),
                    'quantity' => (int) $item->quantity,
                    'name' => mb_substr($name, 0, 50),
                ];
            }

            // B. Shipping Cost per SubOrder
            if ((float) $subOrder->shipping_cost > 0) {
                $storeName = $subOrder->store?->name ?? 'Toko';
                $shippingName = "Ongkir - {$storeName}";

                $itemDetails[] = [
                    'id' => "SHIPPING-{$subOrder->id}",
                    'price' => (int) round((float) $subOrder->shipping_cost),
                    'quantity' => 1,
                    'name' => mb_substr($shippingName, 0, 50),
                ];
            }
        }

        // C. Adjust if there's any platform service fee or rounding discrepancy
        $itemsTotal = (int) array_sum(array_map(fn (array $i) => $i['price'] * $i['quantity'], $itemDetails));
        $difference = $grossAmount - $itemsTotal;

        if ($difference > 0) {
            $itemDetails[] = [
                'id' => 'SERVICE-FEE',
                'price' => $difference,
                'quantity' => 1,
                'name' => 'Biaya Jasa Aplikasi',
            ];
        }

        return [
            'transaction_details' => [
                'order_id' => $orderGroup->group_code,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => $customerDetails,
            'item_details' => $itemDetails,
        ];
    }
}
