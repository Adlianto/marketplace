<?php

namespace App\Models;

use Database\Factories\VariantOptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $variant_id
 * @property string $value
 * @property string|null $image
 * @property-read ProductVariant $variant
 */
class VariantOption extends Model
{
    /** @use HasFactory<VariantOptionFactory> */
    use HasFactory;

    protected $fillable = [
        'variant_id',
        'value',
        'image',
    ];

    /**
     * @return BelongsTo<ProductVariant, $this>
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
