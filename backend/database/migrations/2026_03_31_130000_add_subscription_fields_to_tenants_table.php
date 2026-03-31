<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('subscription_plan')->default('starter')->after('slug');
            $table->enum('subscription_status', ['trial', 'active', 'past_due', 'cancelled'])->default('trial')->after('subscription_plan');
            $table->decimal('monthly_price', 10, 2)->default(0)->after('subscription_status');
            $table->unsignedInteger('max_users')->default(5)->after('monthly_price');
            $table->unsignedInteger('max_products')->default(500)->after('max_users');
            $table->timestamp('subscription_starts_at')->nullable()->after('max_products');
            $table->timestamp('subscription_ends_at')->nullable()->after('subscription_starts_at');
            $table->boolean('is_active')->default(true)->after('subscription_ends_at');
            $table->index('subscription_status');
            $table->index('subscription_ends_at');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropIndex(['subscription_status']);
            $table->dropIndex(['subscription_ends_at']);
            $table->dropColumn([
                'subscription_plan',
                'subscription_status',
                'monthly_price',
                'max_users',
                'max_products',
                'subscription_starts_at',
                'subscription_ends_at',
                'is_active',
            ]);
        });
    }
};
