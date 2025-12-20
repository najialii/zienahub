<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('tracking_number')->nullable()->after('status');
            $table->string('tracking_carrier')->nullable()->after('tracking_number');
            $table->text('admin_notes')->nullable()->after('tracking_carrier');
            $table->timestamp('status_updated_at')->nullable()->after('admin_notes');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['tracking_number', 'tracking_carrier', 'admin_notes', 'status_updated_at']);
        });
    }
};
