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
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_wallet_id')->constrained('store_wallets')->cascadeOnDelete();
            $table->foreignId('sub_order_id')->nullable()->constrained('sub_orders')->nullOnDelete();
            $table->string('type', 20);
            $table->decimal('amount', 15, 2);
            $table->string('description', 255);
            $table->timestamps();

            $table->index('store_wallet_id', 'idx_wallet_tx_wallet');
            $table->index('sub_order_id', 'idx_wallet_tx_suborder');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
