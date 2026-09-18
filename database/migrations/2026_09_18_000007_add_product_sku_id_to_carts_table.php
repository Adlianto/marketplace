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
        Schema::table('carts', function (Blueprint $table) {
            if (! Schema::hasColumn('carts', 'product_sku_id')) {
                $table->foreignId('product_sku_id')->nullable()->after('product_id')->constrained('product_skus')->cascadeOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            if (Schema::hasColumn('carts', 'product_sku_id')) {
                $table->dropConstrainedForeignId('product_sku_id');
            }
        });
    }
};
