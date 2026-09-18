<?php

namespace App\Services\Shipping;

use InvalidArgumentException;

/**
 * CourierRateService — Adapter Pattern driver simulasi lokal.
 *
 * Menghitung tarif pengiriman berdasarkan bobot total gram dan kurir/service
 * yang dipilih menggunakan rumus:
 *   Total Ongkir = base_rate × ceil(total_gram / 1000)
 *
 * Arsitektur driver-based memungkinkan penggantian ke API eksternal
 * (RajaOngkir Pro / Biteship) tanpa mengubah kontrak public.
 */
class CourierRateService
{
    /**
     * @var array<string, array<string, mixed>>
     */
    private readonly array $couriers;

    private readonly int $defaultWeightGram;

    public function __construct()
    {
        /** @var array<string, array<string, mixed>> $couriers */
        $couriers = config('shipping.couriers', []);
        $this->couriers = $couriers;
        $this->defaultWeightGram = (int) config('shipping.default_weight_gram', 200);
    }

    /**
     * Hitung tarif pengiriman.
     *
     * @param  int  $totalWeightGram  Akumulasi berat (SKU weight × qty) dalam gram
     * @param  string  $courierKey  Kunci kurir, contoh: 'jne', 'sicepat', 'gosend'
     * @param  string  $serviceKey  Kunci layanan, contoh: 'REG', 'YES', 'BEST'
     * @return array{cost: int, courier: string, service: string, description: string, weight_kg: float}
     *
     * @throws InvalidArgumentException Jika kurir atau layanan tidak dikenali
     */
    public function calculate(int $totalWeightGram, string $courierKey, string $serviceKey): array
    {
        $courierKey = strtolower($courierKey);
        $courier = $this->couriers[$courierKey] ?? null;

        if ($courier === null) {
            throw new InvalidArgumentException(
                "Kurir '{$courierKey}' tidak dikenali. Pilihan valid: ".implode(', ', array_keys($this->couriers)).'.'
            );
        }

        /** @var array<string, array<string, mixed>> $services */
        $services = $courier['services'] ?? [];
        $service = $services[$serviceKey] ?? null;

        if ($service === null) {
            $validServices = implode(', ', array_keys($services));
            throw new InvalidArgumentException(
                "Layanan '{$serviceKey}' tidak ditemukan untuk kurir '{$courierKey}'. Pilihan valid: {$validServices}."
            );
        }

        $effectiveWeightGram = max($totalWeightGram, $this->defaultWeightGram);
        $weightKg = ceil($effectiveWeightGram / 1000);
        $baseRate = (int) ($service['base_rate'] ?? 0);
        $cost = $baseRate * (int) $weightKg;

        return [
            'cost' => $cost,
            'courier' => (string) ($courier['label'] ?? $courierKey),
            'service' => (string) ($service['name'] ?? $serviceKey),
            'description' => (string) ($service['description'] ?? ''),
            'weight_kg' => (float) $weightKg,
        ];
    }

    /**
     * Kembalikan semua opsi kurir & layanan yang tersedia beserta estimasi biaya.
     *
     * @return array<int, array{courier_key: string, service_key: string, cost: int, courier: string, service: string, description: string, weight_kg: float}>
     */
    public function availableRates(int $totalWeightGram): array
    {
        $rates = [];

        foreach ($this->couriers as $courierKey => $courierConfig) {
            /** @var array<string, array<string, mixed>> $services */
            $services = $courierConfig['services'] ?? [];

            foreach ($services as $serviceKey => $serviceConfig) {
                $result = $this->calculate($totalWeightGram, $courierKey, $serviceKey);
                $rates[] = [
                    'courier_key' => $courierKey,
                    'service_key' => $serviceKey,
                    ...$result,
                ];
            }
        }

        usort($rates, fn (array $a, array $b) => $a['cost'] <=> $b['cost']);

        return $rates;
    }

    /**
     * Kembalikan daftar kurir & service yang valid dari config.
     *
     * @return array<string, list<string>>
     */
    public function supportedCouriers(): array
    {
        $result = [];

        foreach ($this->couriers as $courierKey => $config) {
            /** @var array<string, mixed> $services */
            $services = $config['services'] ?? [];
            $result[$courierKey] = array_keys($services);
        }

        return $result;
    }
}
