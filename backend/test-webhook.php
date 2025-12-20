<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\DeliveryNotification;

echo "Testing Webhook Response Simulation\n";
echo "===================================\n\n";

// Get the latest pending notification
$notification = DeliveryNotification::where('status', 'pending')->latest()->first();

if (!$notification) {
    echo "❌ No pending notifications found. Run test-assignment.php first.\n";
    exit(1);
}

echo "📦 Found notification ID: {$notification->id}\n";
echo "🚚 Delivery Person: {$notification->deliveryPerson->name}\n";
echo "📋 Order: {$notification->order->order_number}\n\n";

// Simulate webhook payload for ACCEPT
$acceptPayload = [
    'callback_query' => [
        'id' => 'test_callback_' . time(),
        'from' => [
            'id' => $notification->deliveryPerson->telegram_chat_id,
            'first_name' => $notification->deliveryPerson->name
        ],
        'message' => [
            'message_id' => 123,
            'chat' => [
                'id' => $notification->deliveryPerson->telegram_chat_id
            ]
        ],
        'data' => "accept_{$notification->id}"
    ]
];

echo "🧪 Simulating ACCEPT button click...\n";

// Make HTTP request to webhook endpoint
$webhookUrl = 'http://localhost:8000/api/telegram/webhook';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $webhookUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($acceptPayload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📡 Webhook Response Code: {$httpCode}\n";
echo "📡 Response: {$response}\n\n";

// Check notification status
$notification->refresh();
echo "📊 Notification Status: {$notification->status}\n";

if ($notification->status === 'accepted') {
    echo "✅ SUCCESS! Notification was accepted\n";
    
    // Check if order was assigned
    $notification->load('order');
    if ($notification->order->delivery_person_id) {
        echo "✅ Order was assigned to delivery person ID: {$notification->order->delivery_person_id}\n";
    } else {
        echo "❌ Order was not assigned\n";
    }
} else {
    echo "❌ Notification status did not change\n";
}

echo "\n🎯 Test completed!\n";