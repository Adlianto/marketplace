<?php

namespace App\Models;

use Database\Factories\CartFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $user_id
 * @property int $product_id
 * @property int $quantity
 * @property bool $selected
 * @property-read Product $product
 * @property-read User|null $user
 */
class Cart extends Model
{
    /** @use HasFactory<CartFactory> */
    use HasFactory;

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

    // Relasi ke Model Product: Setiap item di keranjang mereferensikan 1 produk
    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Relasi opsional ke Model User
    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
