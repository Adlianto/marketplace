<?php

namespace App\Models;

use Database\Factories\OrderGroupFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $group_code
 * @property int $user_id
 * @property string|float $total_amount
 * @property string $payment_status
 * @property string|null $snap_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Collection<int, SubOrder> $subOrders
 */
class OrderGroup extends Model
{
    /** @use HasFactory<OrderGroupFactory> */
    use HasFactory;

    protected $fillable = [
        'group_code',
        'user_id',
        'total_amount',
        'payment_status',
        'snap_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
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
     * @return HasMany<SubOrder, $this>
     */
    public function subOrders(): HasMany
    {
        return $this->hasMany(SubOrder::class);
    }
}
