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
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title_en');
            $table->string('title_ar');
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('image_url');
            $table->string('mobile_image_url')->nullable();
            $table->string('link_url')->nullable();
            $table->string('link_text_en')->nullable();
            $table->string('link_text_ar')->nullable();
            $table->enum('type', ['hero_slider', 'promotional', 'category_banner', 'sidebar_banner', 'footer_banner']);
            $table->enum('position', ['top', 'middle', 'bottom', 'left', 'right', 'center'])->default('center');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->datetime('start_date')->nullable();
            $table->datetime('end_date')->nullable();
            $table->string('background_color')->nullable();
            $table->string('text_color')->nullable();
            $table->enum('text_alignment', ['left', 'center', 'right'])->default('center');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};