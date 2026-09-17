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
            $table->index(['category_id', 'created_at'], 'products_category_id_created_at_index');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->index(['user_id', 'selected'], 'carts_user_id_selected_index');
        });

        Schema::table('addresses', function (Blueprint $table) {
            $table->index(['user_id', 'is_main'], 'addresses_user_id_is_main_index');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'orders_user_id_status_index');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->index('order_id', 'transactions_order_id_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_order_id_index');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_user_id_status_index');
        });

        Schema::table('addresses', function (Blueprint $table) {
            $table->dropIndex('addresses_user_id_is_main_index');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropIndex('carts_user_id_selected_index');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_category_id_created_at_index');
        });
    }
};
