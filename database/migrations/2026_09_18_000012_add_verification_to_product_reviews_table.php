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
        Schema::table('product_reviews', function (Blueprint $table) {
            if (! Schema::hasColumn('product_reviews', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('product_id')->constrained('users')->cascadeOnDelete();
            }

            if (! Schema::hasColumn('product_reviews', 'sub_order_item_id')) {
                $table->foreignId('sub_order_item_id')->nullable()->after('user_id')->unique()->constrained('sub_order_items')->cascadeOnDelete();
            }

            if (! Schema::hasColumn('product_reviews', 'review')) {
                $table->text('review')->nullable()->after('rating');
            }

            if (! Schema::hasColumn('product_reviews', 'photos')) {
                $table->json('photos')->nullable()->after('comment');
            }

            $table->index('product_id', 'idx_product_reviews_product');
            $table->index('user_id', 'idx_product_reviews_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_reviews', function (Blueprint $table) {
            $table->dropIndex('idx_product_reviews_user');
            $table->dropIndex('idx_product_reviews_product');

            if (Schema::hasColumn('product_reviews', 'photos')) {
                $table->dropColumn('photos');
            }

            if (Schema::hasColumn('product_reviews', 'review')) {
                $table->dropColumn('review');
            }

            if (Schema::hasColumn('product_reviews', 'sub_order_item_id')) {
                $table->dropConstrainedForeignId('sub_order_item_id');
            }

            if (Schema::hasColumn('product_reviews', 'user_id')) {
                $table->dropConstrainedForeignId('user_id');
            }
        });
    }
};
