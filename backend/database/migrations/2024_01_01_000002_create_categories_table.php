<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('image_url')->nullable();
            $table->timestamps();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->index('slug');
        });
        
        // Translations table for categories
        Schema::create('category_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('locale', 5); 
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
            // $table->foreignId('tenant_id')->constrained()->onDelete('cascade');            
            $table->unique(['category_id', 'locale']);
            $table->index('locale');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_translations');
        Schema::dropIfExists('categories');
    }
};
