<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Add monthly_fee field that super admin can configure
            $table->decimal('monthly_fee', 10, 2)->default(0)->after('slug');
            
            // Remove the old subscription_plan field if it exists
            if (Schema::hasColumn('tenants', 'subscription_plan')) {
                $table->dropColumn('subscription_plan');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('monthly_fee');
            
            // Restore subscription_plan if needed
            $table->string('subscription_plan')->default('starter')->after('slug');
        });
    }
};
