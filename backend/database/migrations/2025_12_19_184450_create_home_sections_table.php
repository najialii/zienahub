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
        Schema::create('home_sections', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // hero, promotional_top, product_row_1, featured_tags, 
            $table->string('type'); // hero_slider, banner, product_row, featured_tags, custom
            $table->string('title_en')->nullable();
            $table->string('title_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->json('settings')->nullable(); // Flexible settings for each section type
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

/**
 * Run the migrations.
 */
public function down(): void
{
    Schema::dropIfExists('home_sections');
}
};      