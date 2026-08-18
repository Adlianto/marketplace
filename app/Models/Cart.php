<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
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
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Relasi opsional ke Model User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}