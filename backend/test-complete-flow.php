<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\DeliveryPerson;
use App\Http\Controllers\TelegramWebhookController;
use App\Http\Controllers\Admin\DeliveryPersonnelController;
use Illuminate\Http\Request;

echo "Testing Complete Get Chat ID Flow\n";
echo "=================================\n\n";

// Step 1: Create a delivery person without chat ID
$person = DeliveryPerson::create([
    'name' => 'Omar',
    'phone' => '+966501234572',
    'telegram_chat_id' => null,
    'is_active' => true
]);

echo "📝 Step 1: Created delivery person: {$person->name} (ID: {$person->id})\n";
echo "📱 Chat ID: " . ($person->telegram_chat_id ?? 'None') . "\n\n";

// Step 2: Simulate Omar sending /start to the bot
$startPayload = [
    'message' => [
        'message_id' => 125,
        'from' => [
            'id' => 2222222222, // Omar's chat ID
            'first_name' => 'Omar',
            'username' => 'omar_delivery'
        ],
        'chat' => [
            'id' => 2222222222,
            'type' => 'private'
        ],
        'text' => '/start',
        'date' => time()
    ]
];

echo "📱 Step 2: Simulating Omar sending /start (Chat ID: 2222222222)...\n";

$request = new Request();
$request->merge($startPayload);

$webhookController = new TelegramWebhookController();
$webhookResponse = $webhookController->handle($request);

echo "✅ Webhook processed: " . $webhookResponse->getContent() . "\n\n";

// Step 3: Admin clicks "Get Chat ID" button
echo "🔍 Step 3: Admin clicks 'Get Chat ID' button...\n";

$deliveryController = new DeliveryPersonnelController();
$getChatIdRequest = new Request();

$getChatIdResponse = $deliveryController->getChatId($person);
$getChatIdData = json_decode($getChatIdResponse->getContent(), true);

echo "📡 Get Chat ID Response:\n";
echo json_encode($getChatIdData, JSON_PRETTY_PRINT) . "\n\n";

// Step 4: If chat ID found, update it
if (isset($getChatIdData['success']) && $getChatIdData['success'] && isset($getChatIdData['chat_id'])) {
    echo "🔄 Step 4: Updating chat ID...\n";
    
    $updateRequest = new Request();
    $updateRequest->merge([
        'telegram_chat_id' => (string) $getChatIdData['chat_id'], // Ensure string
        'telegram_username' => $getChatIdData['username']
    ]);
    
    $updateResponse = $deliveryController->updateChatId($updateRequest, $person);
    $updateData = json_decode($updateResponse->getContent(), true);
    
    echo "📡 Update Response:\n";
    echo json_encode($updateData, JSON_PRETTY_PRINT) . "\n\n";
    
    if ($updateResponse->getStatusCode() === 200) {
        $person->refresh();
        echo "✅ SUCCESS! Complete flow worked:\n";
        echo "📱 Final Chat ID: {$person->telegram_chat_id}\n";
        echo "👤 Final Username: {$person->telegram_username}\n";
    } else {
        echo "❌ Update failed\n";
    }
} else {
    echo "ℹ️  No chat ID found (Omar might not have sent /start yet)\n";
}

// Clean up
$person->delete();
echo "\n🧹 Cleaned up test data\n";
echo "🎯 Complete flow test finished!\n";