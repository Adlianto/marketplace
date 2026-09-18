<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $sub_order_id
 * @property int $user_id
 * @property int $store_id
 * @property string $reason
 * @property string $description
 * @property array<string> $evidence_photos
 * @property string $status
 * @property string|null $solution
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read SubOrder $subOrder
 * @property-read User $user
 * @property-read Store $store
 */
class DisputeTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'sub_order_id',
        'user_id',
        'store_id',
        'reason',
        'description',
        'evidence_photos',
        'status',
        'solution',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'evidence_photos' => 'array',
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
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Store, $this>
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
