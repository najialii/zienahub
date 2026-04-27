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
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
    $table->string('name_en');
    $table->string('name_ar');
    $table->string('code', 2)->unique(); 
    $table->string('flag_url')->nullable();
    $table->string('phone_code', 5); 
    $table->foreignId('currency_id')->constrained(); 
    $table->boolean('is_active')->default(true);
    $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
