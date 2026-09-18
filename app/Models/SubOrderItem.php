<?php

namespace App\Models;

use Database\Factories\SubOrderItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $sub_order_id
 * @property int $product_id
 * @property int|null $product_sku_id
 * @property string $product_title
 * @property string|null $sku_combination
 * @property string|float $price
 * @property int $quantity
 * @property string|float $total_price
 * @property int $weight_gram
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read SubOrder $subOrder
 * @property-read Product $product
 * @property-read ProductSku|null $productSku
 */
class SubOrderItem extends Model
{
    /** @use HasFactory<SubOrderItemFactory> */
    use HasFactory;

    protected $fillable = [
        'sub_order_id',
        'product_id',
        'product_sku_id',
        'product_title',
        'sku_combination',
        'price',
        'quantity',
        'total_price',
        'weight_gram',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'quantity' => 'integer',
            'total_price' => 'decimal:2',
            'weight_gram' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<SubOrder, $this>
     */
    public function subOrder(): BelongsTo
    {
        return $this->belongsTo(SubOrder::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<ProductSku, $this>
     */
    public function productSku(): BelongsTo
    {
        return $this->belongsTo(ProductSku::class, 'product_sku_id');
    }

    /**
     * Alias for productSku relationship.
     *
     * @return BelongsTo<ProductSku, $this>
     */
    public function sku(): BelongsTo
    {
        return $this->productSku();
    }

    /**
     * @return HasOne<ProductReview, $this>
     */
    public function review(): HasOne
    {
        return $this->hasOne(ProductReview::class);
    }
}
