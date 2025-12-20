<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('gift_box_id')->nullable()->after('user_id')->constrained()->onDelete('set null');
            $table->boolean('is_gift')->default(false)->after('gift_box_id');
            $table->string('recipient_name')->nullable()->after('shipping_country');
            $table->string('recipient_phone')->nullable()->after('recipient_name');
            $table->text('recipient_address')->nullable()->after('recipient_phone');
            $table->text('gift_message')->nullable()->after('recipient_address');
            $table->string('sender_name')->nullable()->after('gift_message');
            
            $table->index('gift_box_id');
            $table->index('is_gift');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['gift_box_id']);
            $table->dropIndex(['gift_box_id']);
            $table->dropIndex(['is_gift']);
            $table->dropColumn([
                'gift_box_id',
                'is_gift',
                'recipient_name',
                'recipient_phone',
                'recipient_address',
                'gift_message',
                'sender_name'
            ]);
        });
    }
};
