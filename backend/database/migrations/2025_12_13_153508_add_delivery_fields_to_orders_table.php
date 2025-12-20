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
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('delivery_person_id')->nullable()->after('status');
            $table->timestamp('assigned_at')->nullable()->after('delivery_person_id');
            $table->timestamp('delivered_at')->nullable()->after('assigned_at');
            $table->text('delivery_notes')->nullable()->after('delivered_at');
            $table->decimal('delivery_latitude', 10, 8)->nullable()->after('delivery_notes');
            $table->decimal('delivery_longitude', 11, 8)->nullable()->after('delivery_latitude');
            
            $table->foreign('delivery_person_id')->references('id')->on('delivery_personnel')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['delivery_person_id']);
            $table->dropColumn([
                'delivery_person_id',
                'assigned_at',
                'delivered_at',
                'delivery_notes',
                'delivery_latitude',
                'delivery_longitude'
            ]);
        });
    }
};