<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $order_number
 * @property int $user_id
 * @property int|null $address_id
 * @property int $total_price
 * @property int $shipping_cost
 * @property int $grand_total
 * @property string $status
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Address|null $address
 * @property-read Collection<int, OrderItem> $items
 * @property-read Transaction|null $transaction
 */
class Order extends Model
{
    /** @use HasFactory<UserFactory> */
    protected $fillable = [
        'order_number',
        'user_id',
        'address_id',
        'total_price',
        'shipping_cost',
        'grand_total',
        'status',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_price' => 'integer',
            'shipping_cost' => 'integer',
            'grand_total' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Address, $this>
     */
    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return HasOne<Transaction, $this>
     */
    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }
}
