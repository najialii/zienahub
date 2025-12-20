<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;
use App\Models\DeliveryPerson;
use App\Services\TelegramService;
use App\Models\DeliveryNotification;

echo "Testing Delivery Assignment System\n";
echo "=================================\n\n";

// Get the first available order
$order = Order::whereNull('delivery_person_id')->first();
if (!$order) {
    echo "❌ No unassigned orders found. Creating a test order...\n";
    
    // Create a test order
    $order = Order::create([
        'order_number' => 'TEST-' . time(),
        'user_id' => 1, // Assuming user ID 1 exists
        'status' => 'pending',
        'total_amount' => 150.00,
        'currency' => 'SAR',
        'shipping_name' => 'Test Customer',
        'shipping_email' => 'test@example.com',
        'shipping_phone' => '+966501234567',
        'shipping_address' => '123 Test Street',
        'shipping_city' => 'Riyadh',
        'shipping_postal_code' => '12345',
        'shipping_country' => 'Saudi Arabia',
        'delivery_latitude' => 24.7136,
        'delivery_longitude' => 46.6753
    ]);
    
    echo "✅ Created test order: {$order->order_number}\n";
}

// Get Naji
$naji = DeliveryPerson::where('name', 'Naji')->first();
if (!$naji) {
    echo "❌ Naji not found in delivery personnel\n";
    exit(1);
}

echo "📦 Order: {$order->order_number}\n";
echo "🚚 Delivery Person: {$naji->name} (Chat ID: {$naji->telegram_chat_id})\n\n";

// Create delivery notification
echo "Creating delivery notification...\n";
$notification = DeliveryNotification::create([
    'order_id' => $order->id,
    'delivery_person_id' => $naji->id,
    'status' => 'pending',
    'sent_at' => now(),
    'expires_at' => now()->addMinutes(15)
]);

echo "✅ Notification created with ID: {$notification->id}\n";

// Send Telegram notification
echo "Sending Telegram notification...\n";
$telegramService = new TelegramService();
$result = $telegramService->sendOrderNotification($naji, $order, $notification->id);

if ($result) {
    echo "✅ Telegram notification sent successfully!\n";
    echo "📱 Naji should receive a message with Accept/Decline buttons\n\n";
    
    // Update notification with message ID if available
    if (isset($result['result']['message_id'])) {
        $notification->update(['telegram_message_id' => $result['result']['message_id']]);
        echo "📝 Message ID saved: {$result['result']['message_id']}\n";
    }
} else {
    echo "❌ Failed to send Telegram notification\n";
}

echo "\n🎯 Test completed!\n";
echo "Check Naji's Telegram for the delivery request message.\n";