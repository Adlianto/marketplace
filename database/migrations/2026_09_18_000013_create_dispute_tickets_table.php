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
        Schema::create('dispute_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sub_order_id')->unique()->constrained('sub_orders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('store_id')->constrained('stores')->cascadeOnDelete();
            $table->string('reason');
            $table->text('description');
            $table->json('evidence_photos');
            $table->string('status', 50)->default('open');
            $table->string('solution', 100)->nullable();
            $table->timestamps();

            $table->index('sub_order_id', 'idx_dispute_sub_order');
            $table->index('store_id', 'idx_dispute_store');
            $table->index('user_id', 'idx_dispute_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispute_tickets');
    }
};
