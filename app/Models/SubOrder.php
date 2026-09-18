<?php

namespace App\Models;

use App\Enums\SubOrderStatus;
use App\Exceptions\InvalidOrderStateTransitionException;
use App\Services\Order\SubOrderStateMachine;
use Database\Factories\SubOrderFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_group_id
 * @property int $store_id
 * @property int $user_id
 * @property int $address_id
 * @property string $sub_order_number
 * @property string $courier_name
 * @property string $courier_service
 * @property string|null $tracking_number
 * @property string|float $items_subtotal
 * @property string|float $shipping_cost
 * @property string|float $total_amount
 * @property string $status
 * @property Carbon|null $shipped_at
 * @property Carbon|null $delivered_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read OrderGroup $orderGroup
 * @property-read Store $store
 * @property-read User $user
 * @property-read Address $address
 * @property-read Collection<int, SubOrderItem> $items
 * @property-read Collection<int, WalletTransaction> $walletTransactions
 */
class SubOrder extends Model
{
    /** @use HasFactory<SubOrderFactory> */
    use HasFactory;

    protected $fillable = [
        'order_group_id',
        'store_id',
        'user_id',
        'address_id',
        'sub_order_number',
        'courier_name',
        'courier_service',
        'tracking_number',
        'items_subtotal',
        'shipping_cost',
        'total_amount',
        'status',
        'shipped_at',
        'delivered_at',
        'completed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'items_subtotal' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<OrderGroup, $this>
     */
    public function orderGroup(): BelongsTo
    {
        return $this->belongsTo(OrderGroup::class);
    }

    /**
     * @return BelongsTo<Store, $this>
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
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
     * @return HasMany<SubOrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(SubOrderItem::class);
    }

    /**
     * @return HasMany<WalletTransaction, $this>
     */
    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * @return HasOne<DisputeTicket, $this>
     */
    public function disputeTicket(): HasOne
    {
        return $this->hasOne(DisputeTicket::class);
    }

    /**
     * Alias for disputeTicket relation.
     *
     * @return HasOne<DisputeTicket, $this>
     */
    public function dispute(): HasOne
    {
        return $this->disputeTicket();
    }

    /**
     * Determine if this SubOrder can transition to the target status.
     */
    public function canTransitionTo(SubOrderStatus|string $targetStatus): bool
    {
        return app(SubOrderStateMachine::class)->canTransitionTo($this, $targetStatus);
    }

    /**
     * Transition this SubOrder to the target status using the state machine.
     *
     * @throws InvalidOrderStateTransitionException
     */
    public function transitionTo(SubOrderStatus|string $targetStatus): void
    {
        app(SubOrderStateMachine::class)->transitionTo($this, $targetStatus);
    }
}
