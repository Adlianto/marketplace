<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->decimal('price', 15, 2);
            $table->decimal('original_price', 15, 2)->nullable();
            $table->integer('discount')->nullable();
            $table->string('city')->default('Jakarta Pusat');
            $table->decimal('rating', 2, 1)->default(5.0);
            $table->string('sold_count')->default('0');
            $table->boolean('is_official')->default(false);
            $table->string('image')->nullable();
            $table->integer('stock')->default(10);
            $table->timestamps();
            $table->index('category_id');
            $table->index('price');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
