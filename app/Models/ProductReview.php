<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_id
 * @property int|null $user_id
 * @property int|null $sub_order_item_id
 * @property string $user_name
 * @property string|null $user_avatar
 * @property int $rating
 * @property string|null $review
 * @property string|null $comment
 * @property array<string>|null $photos
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product $product
 * @property-read User|null $user
 * @property-read SubOrderItem|null $subOrderItem
 */
class ProductReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'sub_order_item_id',
        'user_name',
        'user_avatar',
        'rating',
        'review',
        'comment',
        'photos',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'photos' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<SubOrderItem, $this>
     */
    public function subOrderItem(): BelongsTo
    {
        return $this->belongsTo(SubOrderItem::class);
    }

    /**
     * Compatibility accessor for review text.
     */
    public function getReviewAttribute(?string $value): ?string
    {
        return $value ?? $this->attributes['comment'] ?? null;
    }

    /**
     * Compatibility accessor for comment text.
     */
    public function getCommentAttribute(?string $value): ?string
    {
        return $value ?? $this->attributes['review'] ?? null;
    }

    /**
     * Check whether this review is from a verified purchase.
     */
    public function isVerifiedPurchase(): bool
    {
        return ! empty($this->sub_order_item_id);
    }
}
