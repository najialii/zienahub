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
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('slug')->unique();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();
            
             
            // $table->enum('type', [
            //     'occasion', 'giftee', 'style', 'season', 
            //     'age_group', 'promotion', 'brand_deal', 'other'
            // ])->default('other');
            $table->string('type');
            // UI & Branding
            $table->string('color')->default('#3B82F6'); 
            $table->string('icon')->nullable(); 
            $table->string('image_url')->nullable();

            $table->integer('discount_percentage')->nullable(); // e.g., 20 for 20%
            $table->datetime('starts_at')->nullable();          // For scheduled sales
            $table->datetime('ends_at')->nullable();            // For countdown timers
            
            // Operational
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false); 
            
            $table->timestamps();

            $table->index(['type', 'is_active', 'is_featured']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};