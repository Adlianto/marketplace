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
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('store_id')->nullable()->after('id')->constrained('stores')->cascadeOnDelete();
            $table->boolean('has_variants')->default(false)->after('stock');

            $table->index('store_id', 'idx_products_store_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_store_id');
            $table->dropConstrainedForeignId('store_id');
            $table->dropColumn('has_variants');
        });
    }
};
