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
        Schema::create('product_skus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('sku_code', 100)->unique();
            $table->string('combination_key', 255);
            $table->decimal('price', 15, 2);
            $table->decimal('original_price', 15, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->integer('weight_gram')->default(200);
            $table->string('image', 255)->nullable();
            $table->timestamps();

            $table->index(['product_id', 'combination_key'], 'idx_skus_product_combination');
            $table->index('stock', 'idx_skus_stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_skus');
    }
};
