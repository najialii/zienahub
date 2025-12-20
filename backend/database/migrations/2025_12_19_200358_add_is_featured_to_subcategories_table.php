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
        Schema::table('subcategories', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('slug');
            $table->integer('featured_sort_order')->nullable()->after('is_featured');
            
            // Add index for better performance when querying featured subcategories
            $table->index(['is_featured', 'featured_sort_order']);
        });
    }

    /**
     * Run the migrations.
     */
    public function down(): void
    {
        Schema::table('subcategories', function (Blueprint $table) {
            $table->dropIndex(['is_featured', 'featured_sort_order']);
            $table->dropColumn(['is_featured', 'featured_sort_order']);
        });
    }
};