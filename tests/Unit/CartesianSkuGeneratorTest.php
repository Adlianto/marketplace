<?php

use App\Actions\Product\GenerateProductSkusAction;

test('generates exact cartesian product combinations for 2x3 dimensions without duplication', function () {
    $action = new GenerateProductSkusAction;

    $variants = [
        'Warna' => ['Hitam', 'Putih'],
        'Ukuran' => ['S', 'M', 'L'],
    ];

    $combinations = $action->generateCombinations($variants);

    expect($combinations)->toBeArray()
        ->toHaveCount(6)
        ->toEqual([
            'Hitam-S',
            'Hitam-M',
            'Hitam-L',
            'Putih-S',
            'Putih-M',
            'Putih-L',
        ])
        ->and(count($combinations))->toBe(count(array_unique($combinations)));
});

test('generates combinations for single dimension variant', function () {
    $action = new GenerateProductSkusAction;

    $variants = [
        'Ukuran' => ['S', 'M', 'L'],
    ];

    $combinations = $action->generateCombinations($variants);

    expect($combinations)->toBe([
        'S',
        'M',
        'L',
    ]);
});

test('handles single option variant gracefully', function () {
    $action = new GenerateProductSkusAction;

    $variants = [
        'Warna' => ['Merah'],
    ];

    $combinations = $action->generateCombinations($variants);

    expect($combinations)->toBe(['Merah']);
});

test('handles empty variant options array and empty dimensions gracefully', function () {
    $action = new GenerateProductSkusAction;

    expect($action->generateCombinations([]))->toBe([])
        ->and($action->generateCombinations(['Warna' => []]))->toBe([]);
});

test('generates 3-dimensional cartesian product combinations', function () {
    $action = new GenerateProductSkusAction;

    $variants = [
        'Warna' => ['Merah', 'Biru'],
        'Ukuran' => ['M', 'L'],
        'Tipe' => ['Slim', 'Regular'],
    ];

    // 2 x 2 x 2 = 8 combinations
    $combinations = $action->generateCombinations($variants);

    expect($combinations)->toHaveCount(8)
        ->toContain(
            'Merah-M-Slim',
            'Merah-M-Regular',
            'Merah-L-Slim',
            'Merah-L-Regular',
            'Biru-M-Slim',
            'Biru-M-Regular',
            'Biru-L-Slim',
            'Biru-L-Regular'
        );
});

test('generates standardized sku code adhering to pattern SKU-{PRODUCT_ID}-{RANDOM_HASH}', function () {
    $action = new GenerateProductSkusAction;

    $skuCode = $action->generateSkuCode(42, 6);

    expect($skuCode)->toMatch('/^SKU-42-[A-Z0-9]{6}$/');
});

test('generates complete sku matrix with default attributes', function () {
    $action = new GenerateProductSkusAction;

    $variants = [
        'Warna' => ['Hitam'],
        'Ukuran' => ['M', 'L'],
    ];

    $matrix = $action->generateSkuMatrix(99, $variants, [
        'price' => 125000,
        'original_price' => 150000,
        'stock' => 10,
        'weight_gram' => 300,
    ]);

    expect($matrix)->toHaveCount(2)
        ->and($matrix[0]['product_id'])->toBe(99)
        ->and($matrix[0]['combination_key'])->toBe('Hitam-M')
        ->and($matrix[0]['sku_code'])->toMatch('/^SKU-99-[A-Z0-9]{6}$/')
        ->and($matrix[0]['price'])->toBe(125000)
        ->and($matrix[0]['original_price'])->toBe(150000)
        ->and($matrix[0]['stock'])->toBe(10)
        ->and($matrix[0]['weight_gram'])->toBe(300)
        ->and($matrix[1]['combination_key'])->toBe('Hitam-L');
});
