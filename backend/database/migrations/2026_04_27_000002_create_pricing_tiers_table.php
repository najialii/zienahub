<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Starter", "Professional", "Enterprise"
            $table->decimal('monthly_fee', 10, 2);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Update tenants table to reference pricing tier
        Schema::table('tenants', function (Blueprint $table) {
            $table->foreignId('pricing_tier_id')->nullable()->after('monthly_fee')->constrained('pricing_tiers')->nullOnDelete();
            // If pricing_tier_id is set, use tier's fee; otherwise use custom monthly_fee
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropForeign(['pricing_tier_id']);
            $table->dropColumn('pricing_tier_id');
        });
        
        Schema::dropIfExists('pricing_tiers');
    }
};
