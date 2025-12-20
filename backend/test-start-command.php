<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\TelegramWebhookController;
use Illuminate\Http\Request;

echo "Testing /start Command Handler\n";
echo "==============================\n\n";

// Simulate a /start message from a new user
$startPayload = [
    'message' => [
        'message_id' => 123,
        'from' => [
            'id' => 9999999999, // New chat ID
            'first_name' => 'Ahmed',
            'username' => 'ahmed_test'
        ],
        'chat' => [
            'id' => 9999999999,
            'type' => 'private'
        ],
        'text' => '/start',
        'date' => time()
    ]
];

echo "🧪 Simulating /start command from Ahmed (Chat ID: 9999999999)...\n";

// Create request
$request = new Request();
$request->merge($startPayload);

// Handle webhook
$controller = new TelegramWebhookController();
$response = $controller->handle($request);

echo "📡 Webhook Response: " . $response->getContent() . "\n\n";

// Check if delivery person was created
$newPerson = \App\Models\DeliveryPerson::where('telegram_chat_id', '9999999999')->first();

if ($newPerson) {
    echo "✅ SUCCESS! New delivery person created:\n";
    echo "Name: {$newPerson->name}\n";
    echo "Chat ID: {$newPerson->telegram_chat_id}\n";
    echo "Username: {$newPerson->telegram_username}\n";
    echo "Active: " . ($newPerson->is_active ? 'Yes' : 'No') . "\n";
    echo "Notes: {$newPerson->notes}\n";
} else {
    echo "❌ No delivery person was created\n";
}

echo "\n🎯 Test completed!\n";