<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\DeliveryPerson;
use App\Http\Controllers\TelegramWebhookController;
use Illuminate\Http\Request;

echo "Testing Existing Person Update\n";
echo "==============================\n\n";

// Create a delivery person without chat ID
$person = DeliveryPerson::create([
    'name' => 'Khalid',
    'phone' => '+966501234569',
    'telegram_chat_id' => null,
    'is_active' => true
]);

echo "📝 Created delivery person: {$person->name} (ID: {$person->id})\n";
echo "📱 Chat ID: " . ($person->telegram_chat_id ?? 'None') . "\n\n";

// Simulate /start message from Khalid
$startPayload = [
    'message' => [
        'message_id' => 124,
        'from' => [
            'id' => 1111111111, // New chat ID
            'first_name' => 'Khalid',
            'username' => 'khalid_delivery'
        ],
        'chat' => [
            'id' => 1111111111,
            'type' => 'private'
        ],
        'text' => '/start',
        'date' => time()
    ]
];

echo "🧪 Simulating /start command from Khalid (Chat ID: 1111111111)...\n";

// Create request
$request = new Request();
$request->merge($startPayload);

// Handle webhook
$controller = new TelegramWebhookController();
$response = $controller->handle($request);

echo "📡 Webhook Response: " . $response->getContent() . "\n\n";

// Check if person was updated
$person->refresh();

echo "📊 Updated delivery person:\n";
echo "Name: {$person->name}\n";
echo "Chat ID: " . ($person->telegram_chat_id ?? 'None') . "\n";
echo "Username: " . ($person->telegram_username ?? 'None') . "\n";
echo "Active: " . ($person->is_active ? 'Yes' : 'No') . "\n";

if ($person->telegram_chat_id === '1111111111') {
    echo "✅ SUCCESS! Chat ID was updated automatically!\n";
} else {
    echo "❌ Chat ID was not updated\n";
}

echo "\n🎯 Test completed!\n";