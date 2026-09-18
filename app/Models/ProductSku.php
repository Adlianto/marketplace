<?php

namespace App\Models;

use Database\Factories\ProductSkuFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property string $sku_code
 * @property string $combination_key
 * @property string|float $price
 * @property string|float|null $original_price
 * @property int $stock
 * @property int $weight_gram
 * @property string|null $image
 * @property-read Product $product
 */
class ProductSku extends Model
{
    /** @use HasFactory<ProductSkuFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku_code',
        'combination_key',
        'price',
        'original_price',
        'stock',
        'weight_gram',
        'image',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'stock' => 'integer',
            'weight_gram' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
