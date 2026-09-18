<?php

namespace App\Actions\Shipping;

use App\Services\Shipping\CourierRateService;
use InvalidArgumentException;

/**
 * CalculateStoreShippingAction
 *
 * Menghitung ongkos kirim untuk satu toko berdasarkan akumulasi berat
 * item-item SKU di keranjang yang sudah dikelompokkan per toko.
 *
 * Rumus:
 *   Total Ongkir = base_rate × ceil(Σ(SKU weight_gram × qty) / 1000)
 *
 * Input items adalah array dengan shape:
 *   [['weight_gram' => int, 'quantity' => int], ...]
 */
class CalculateStoreShippingAction
{
    public function __construct(
        protected CourierRateService $courierRateService
    ) {}

    /**
     * Hitung ongkos kirim untuk satu toko.
     *
     * @param  array<int, array{weight_gram?: int|null, quantity: int}>  $items  Item keranjang milik toko ini
     * @param  string  $courierKey  Kunci kurir, misal: 'jne', 'sicepat', 'gosend'
     * @param  string  $serviceKey  Kunci layanan, misal: 'REG', 'YES', 'BEST', 'Instant'
     * @return array{cost: int, courier: string, service: string, description: string, weight_kg: float, total_weight_gram: int}
     *
     * @throws InvalidArgumentException Jika kurir atau service tidak valid
     */
    public function execute(array $items, string $courierKey, string $serviceKey): array
    {
        $totalWeightGram = $this->accumulateWeight($items);

        $result = $this->courierRateService->calculate($totalWeightGram, $courierKey, $serviceKey);

        return [
            ...$result,
            'total_weight_gram' => $totalWeightGram,
        ];
    }

    /**
     * Hitung total berat (gram) dari kumpulan item keranjang satu toko.
     *
     * @param  array<int, array{weight_gram?: int|null, quantity: int}>  $items
     */
    public function accumulateWeight(array $items): int
    {
        $total = 0;

        foreach ($items as $item) {
            $weightGram = isset($item['weight_gram']) && $item['weight_gram'] !== null
                ? (int) $item['weight_gram']
                : (int) config('shipping.default_weight_gram', 200);

            $quantity = (int) ($item['quantity'] ?? 1);
            $total += $weightGram * max(1, $quantity);
        }

        return $total;
    }

    /**
     * Kembalikan semua opsi ongkos kirim yang tersedia untuk toko ini.
     *
     * @param  array<int, array{weight_gram?: int|null, quantity: int}>  $items
     * @return array<int, array{courier_key: string, service_key: string, cost: int, courier: string, service: string, description: string, weight_kg: float, total_weight_gram: int}>
     */
    public function allRates(array $items): array
    {
        $totalWeightGram = $this->accumulateWeight($items);
        $rates = $this->courierRateService->availableRates($totalWeightGram);

        return array_map(
            fn (array $rate) => [...$rate, 'total_weight_gram' => $totalWeightGram],
            $rates,
        );
    }
}
