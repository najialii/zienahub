<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\DeliveryNotification;
use App\Services\TelegramService;

echo "Debugging Recent Notification...\n";
echo "================================\n";

// Get the most recent notification
$notification = DeliveryNotification::with(['order', 'deliveryPerson'])
    ->latest()
    ->first();

if (!$notification) {
    echo "❌ No notifications found\n";
    exit(1);
}

echo "📦 Notification ID: {$notification->id}\n";
echo "📋 Order: {$notification->order->order_number}\n";
echo "🚚 Delivery Person: {$notification->deliveryPerson->name}\n";
echo "📱 Chat ID: {$notification->deliveryPerson->telegram_chat_id}\n";
echo "📊 Status: {$notification->status}\n";
echo "📝 Telegram Message ID: " . ($notification->telegram_message_id ?? 'None') . "\n";
echo "⏰ Created: {$notification->created_at}\n\n";

// Try to send the notification again
echo "🧪 Testing notification send...\n";

$telegramService = new TelegramService();
$result = $telegramService->sendOrderNotification(
    $notification->deliveryPerson, 
    $notification->order, 
    $notification->id
);

if ($result) {
    echo "✅ Notification sent successfully!\n";
    echo "📝 Message ID: " . ($result['result']['message_id'] ?? 'Unknown') . "\n";
    
    // Update the notification with message ID
    if (isset($result['result']['message_id'])) {
        $notification->update(['telegram_message_id' => $result['result']['message_id']]);
        echo "💾 Updated notification with message ID\n";
    }
} else {
    echo "❌ Failed to send notification\n";
    echo "🔍 Check if:\n";
    echo "   - Chat ID is correct: {$notification->deliveryPerson->telegram_chat_id}\n";
    echo "   - Delivery person started the bot\n";
    echo "   - Bot token is valid\n";
}

echo "\n🎯 Debug completed!\n";