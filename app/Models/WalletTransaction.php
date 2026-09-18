<?php

namespace App\Models;

use Database\Factories\WalletTransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $store_wallet_id
 * @property int|null $sub_order_id
 * @property string $type
 * @property string|float $amount
 * @property string $description
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read StoreWallet $wallet
 * @property-read StoreWallet $storeWallet
 * @property-read SubOrder|null $subOrder
 */
class WalletTransaction extends Model
{
    /** @use HasFactory<WalletTransactionFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'store_wallet_id',
        'sub_order_id',
        'type',
        'amount',
        'description',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<StoreWallet, $this>
     */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(StoreWallet::class, 'store_wallet_id');
    }

    /**
     * Alias relation for store_wallet.
     *
     * @return BelongsTo<StoreWallet, $this>
     */
    public function storeWallet(): BelongsTo
    {
        return $this->belongsTo(StoreWallet::class, 'store_wallet_id');
    }

    /**
     * @return BelongsTo<SubOrder, $this>
     */
    public function subOrder(): BelongsTo
    {
        return $this->belongsTo(SubOrder::class);
    }
}
