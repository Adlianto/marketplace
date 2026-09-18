<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $store_id
 * @property int|null $category_id
 * @property string $title
 * @property string|null $slug
 * @property string|float $price
 * @property string|float $original_price
 * @property int|null $discount
 * @property string|null $image
 * @property int|null $stock
 * @property bool $has_variants
 * @property string|null $city
 * @property float|int|null $rating_avg
 * @property int|null $reviews_count
 * @property-read Store|null $store
 * @property-read Category|null $category
 * @property-read Collection<int, ProductSpecification> $specifications
 * @property-read Collection<int, ProductReview> $reviews
 * @property-read Collection<int, Cart> $carts
 * @property-read Collection<int, ProductVariant> $variants
 * @property-read Collection<int, ProductSku> $skus
 */
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'has_variants' => 'boolean',
            'is_official' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Store, $this>
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<ProductSpecification, $this>
     */
    public function specifications(): HasMany
    {
        return $this->hasMany(ProductSpecification::class);
    }

    /**
     * @return HasMany<ProductReview, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class)->latest();
    }

    /**
     * @return HasMany<Cart, $this>
     */
    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    /**
     * @return HasMany<ProductVariant, $this>
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * @return HasMany<ProductSku, $this>
     */
    public function skus(): HasMany
    {
        return $this->hasMany(ProductSku::class);
    }
}
