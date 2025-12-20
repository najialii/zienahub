<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gift_boxes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('status', ['active', 'sent', 'purchased'])->default('active');
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });
        
        Schema::create('gift_box_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gift_box_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->decimal('price_at_addition', 10, 2);
            $table->timestamps();
            
            $table->index('gift_box_id');
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gift_box_items');
        Schema::dropIfExists('gift_boxes');
    }
};
