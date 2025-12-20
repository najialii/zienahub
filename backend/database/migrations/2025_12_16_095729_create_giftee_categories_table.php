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
        Schema::create('giftee_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name_en'); // Father, Mother, Brother, etc.
            $table->string('name_ar'); // أب، أم، أخ، etc.
            $table->string('slug')->unique();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('icon')->nullable(); // Icon name or emoji
            $table->string('color')->default('#000000'); // Hex color for theming
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('image_url')->nullable(); // Category image
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('giftee_categories');
    }
};