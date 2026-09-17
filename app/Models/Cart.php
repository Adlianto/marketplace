<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property int $product_id
 * @property int $quantity
 * @property bool $selected
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product $product
 * @property-read User|null $user
 */
class Cart extends Model
{
    // Kolom tabel yang diizinkan untuk diisi secara massal (Mass Assignment)
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'selected',
    ];

    // Mengubah tipe kolom selected otomatis menjadi boolean di Laravel
    protected $casts = [
        'selected' => 'boolean',
        'quantity' => 'integer',
    ];

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
}
