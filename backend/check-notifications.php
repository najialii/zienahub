<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\DeliveryNotification;

echo "Recent Delivery Notifications:\n";
echo "==============================\n";

$notifications = DeliveryNotification::with(['order', 'deliveryPerson'])
    ->latest()
    ->take(10)
    ->get();

if ($notifications->isEmpty()) {
    echo "❌ No delivery notifications found!\n";
    echo "This means the admin interface is not creating notifications.\n";
} else {
    foreach ($notifications as $notification) {
        echo "ID: {$notification->id}\n";
        echo "Order: {$notification->order->order_number}\n";
        echo "Delivery Person: {$notification->deliveryPerson->name}\n";
        echo "Status: {$notification->status}\n";
        echo "Created: {$notification->created_at}\n";
        echo "Telegram Message ID: " . ($notification->telegram_message_id ?? 'None') . "\n";
        echo "---\n";
    }
}

echo "\nTotal notifications: " . $notifications->count() . "\n";