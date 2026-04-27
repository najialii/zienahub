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
            $table->string('brand')->nullable();
            $table->string('size')->nullable();
            $table->string('country_of_origin')->nullable();
        });
        
        Schema::table('product_translations', function (Blueprint $table) {
            $table->text('how_to_use')->nullable();
            $table->text('ingredients')->nullable();
            $table->text('benefits')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_translations', function (Blueprint $table) {
            $table->dropColumn(['how_to_use', 'ingredients', 'benefits']);
        });
        
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['brand', 'size', 'country_of_origin']);
        });
    }
};
