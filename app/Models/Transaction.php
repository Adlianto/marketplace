<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_id
 * @property string $payment_method
 * @property string $payment_status
 * @property string $transaction_code
 * @property Carbon|null $paid_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Order $order
 */
class Transaction extends Model
{
    protected $fillable = [
        'order_id',
        'payment_method',
        'payment_status',
        'transaction_code',
        'paid_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
