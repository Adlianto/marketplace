<?php

use App\Actions\Shipping\CalculateStoreShippingAction;
use App\Services\Shipping\CourierRateService;

// ---------------------------------------------------------------------------
// CourierRateService — Unit Tests
// ---------------------------------------------------------------------------

describe('CourierRateService', function () {

    beforeEach(function () {
        $this->service = new CourierRateService;
    });

    it('rounds weight up to nearest kg for tariff calculation', function (int $grams, int $expectedKg) {
        $result = $this->service->calculate($grams, 'jne', 'REG');
        expect($result['weight_kg'])->toBe((float) $expectedKg);
    })->with([
        'exact 1 kg' => [1000, 1],
        '1200 gram → 2 kg' => [1200, 2],
        '1001 gram → 2 kg' => [1001, 2],
        '999 gram → 1 kg (min)' => [999, 1],   // default_weight_gram=200 < 999, so 999 used
        '2500 gram → 3 kg' => [2500, 3],
        '3000 gram → 3 kg' => [3000, 3],
        '3001 gram → 4 kg' => [3001, 4],
    ]);

    it('applies default minimum weight when input is below threshold', function () {
        // default_weight_gram = 200 from config; 100 < 200 → effective = 200 → 1 kg
        $result = $this->service->calculate(100, 'jne', 'REG');
        expect($result['weight_kg'])->toBe(1.0);
    });

    it('calculates correct cost using base_rate × weight_kg', function () {
        // JNE REG: base_rate = 8000, 1200 gram → ceil(1200/1000) = 2 kg
        $result = $this->service->calculate(1200, 'jne', 'REG');
        expect($result['cost'])->toBe(8000 * 2);
    });

    it('calculates JNE YES correctly', function () {
        // YES: base_rate = 18000, 3000 gram → 3 kg
        $result = $this->service->calculate(3000, 'jne', 'YES');
        expect($result['cost'])->toBe(18000 * 3)
            ->and($result['courier'])->toBe('JNE')
            ->and($result['weight_kg'])->toBe(3.0);
    });

    it('calculates SiCepat SIUNT correctly', function () {
        // SIUNT: base_rate = 7000, 2200 gram → 3 kg
        $result = $this->service->calculate(2200, 'sicepat', 'SIUNT');
        expect($result['cost'])->toBe(7000 * 3)
            ->and($result['courier'])->toBe('SiCepat');
    });

    it('calculates SiCepat BEST correctly', function () {
        // BEST: base_rate = 15000, 1000 gram → 1 kg
        $result = $this->service->calculate(1000, 'sicepat', 'BEST');
        expect($result['cost'])->toBe(15000 * 1);
    });

    it('calculates GoSend Instant correctly', function () {
        // GoSend Instant: base_rate = 12000, 500 gram → 1 kg
        $result = $this->service->calculate(500, 'gosend', 'Instant');
        expect($result['cost'])->toBe(12000 * 1)
            ->and($result['courier'])->toBe('GoSend');
    });

    it('returns all available rates sorted by cost ascending', function () {
        $rates = $this->service->availableRates(1000);
        $costs = array_column($rates, 'cost');
        expect($costs)->toBe(array_values(array_filter($costs, fn () => true)))
            ->and($costs[0])->toBeLessThanOrEqual($costs[count($costs) - 1]);
    });

    it('throws InvalidArgumentException for unknown courier', function () {
        expect(fn () => $this->service->calculate(1000, 'unknown_courier', 'REG'))
            ->toThrow(InvalidArgumentException::class, "Kurir 'unknown_courier' tidak dikenali.");
    });

    it('throws InvalidArgumentException for unknown service on valid courier', function () {
        expect(fn () => $this->service->calculate(1000, 'jne', 'UNKNOWN'))
            ->toThrow(InvalidArgumentException::class, "Layanan 'UNKNOWN' tidak ditemukan untuk kurir 'jne'.");
    });

    it('courier key comparison is case-insensitive', function () {
        // Should normalise 'JNE' → 'jne' internally
        $result = $this->service->calculate(1000, 'JNE', 'REG');
        expect($result['cost'])->toBe(8000);
    });

    it('supportedCouriers returns all configured couriers with their services', function () {
        $supported = $this->service->supportedCouriers();
        expect($supported)->toHaveKey('jne')
            ->and($supported['jne'])->toContain('REG', 'YES')
            ->and($supported)->toHaveKey('sicepat')
            ->and($supported['sicepat'])->toContain('SIUNT', 'BEST')
            ->and($supported)->toHaveKey('gosend');
    });
});

// ---------------------------------------------------------------------------
// CalculateStoreShippingAction — Unit Tests
// ---------------------------------------------------------------------------

describe('CalculateStoreShippingAction', function () {

    beforeEach(function () {
        $this->action = new CalculateStoreShippingAction(new CourierRateService);
    });

    it('accumulates weight correctly from multiple items', function () {
        $items = [
            ['weight_gram' => 500, 'quantity' => 2],  // 1000
            ['weight_gram' => 300, 'quantity' => 1],  // 300
        ];
        // total = 1300 gram → 2 kg
        $result = $this->action->execute($items, 'jne', 'REG');
        expect($result['total_weight_gram'])->toBe(1300)
            ->and($result['weight_kg'])->toBe(2.0)
            ->and($result['cost'])->toBe(8000 * 2);
    });

    it('uses default weight for items missing weight_gram', function () {
        // default_weight_gram = 200 per item
        $items = [
            ['quantity' => 3],
        ];
        // total = 200 × 3 = 600 gram → 1 kg
        $result = $this->action->execute($items, 'jne', 'REG');
        expect($result['total_weight_gram'])->toBe(600)
            ->and($result['weight_kg'])->toBe(1.0);
    });

    it('uses default weight for items with null weight_gram', function () {
        $items = [
            ['weight_gram' => null, 'quantity' => 2],
        ];
        // 200 × 2 = 400 gram → 1 kg
        $result = $this->action->execute($items, 'sicepat', 'SIUNT');
        expect($result['total_weight_gram'])->toBe(400)
            ->and($result['weight_kg'])->toBe(1.0);
    });

    it('returns total_weight_gram in result', function () {
        $items = [
            ['weight_gram' => 1200, 'quantity' => 1],
        ];
        $result = $this->action->execute($items, 'jne', 'YES');
        expect($result)->toHaveKey('total_weight_gram')
            ->and($result['total_weight_gram'])->toBe(1200);
    });

    it('allRates returns rates for all couriers sorted by cost', function () {
        $items = [
            ['weight_gram' => 1000, 'quantity' => 1],
        ];
        $rates = $this->action->allRates($items);
        expect($rates)->not->toBeEmpty();
        $costs = array_column($rates, 'cost');
        expect($costs[0])->toBeLessThanOrEqual($costs[count($costs) - 1]);
    });

    it('all rates include total_weight_gram', function () {
        $items = [
            ['weight_gram' => 800, 'quantity' => 2],
        ];
        $rates = $this->action->allRates($items);
        foreach ($rates as $rate) {
            expect($rate)->toHaveKey('total_weight_gram');
        }
    });

    it('throws for invalid courier in execute', function () {
        $items = [['weight_gram' => 500, 'quantity' => 1]];
        expect(fn () => $this->action->execute($items, 'invalid', 'REG'))
            ->toThrow(InvalidArgumentException::class);
    });

    it('accumulates zero weight items safely as default weight', function () {
        $items = [
            ['weight_gram' => 0, 'quantity' => 2],
        ];
        // weight_gram 0 is falsy-but-set; treated as 0 → total 0 → effective = max(0, 200) = 200 → 1 kg
        $result = $this->action->execute($items, 'jne', 'REG');
        expect($result['weight_kg'])->toBe(1.0);
    });
});
