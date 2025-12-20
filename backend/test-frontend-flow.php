<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\DeliveryPerson;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\DeliveryPersonnelController;

echo "Testing Frontend Flow Simulation\n";
echo "================================\n\n";

// Create a test delivery person without chat ID
$person = DeliveryPerson::create([
    'name' => 'TestUser',
    'phone' => '+966501234571',
    'telegram_chat_id' => null,
    'is_active' => true
]);

echo "📝 Created test person: {$person->name} (ID: {$person->id})\n";
echo "📱 Current Chat ID: " . ($person->telegram_chat_id ?? 'None') . "\n\n";

// Simulate the frontend sending a number (like Telegram API returns)
$chatIdFromTelegram = 1234567890; // This is a number, not string

echo "🧪 Simulating frontend update with chat ID as number: {$chatIdFromTelegram}\n";

// Test the update with number converted to string (like frontend does now)
$requestData = [
    'telegram_chat_id' => (string) $chatIdFromTelegram, // Convert to string
    'telegram_username' => '@test_frontend_user'
];

echo "📤 Sending data:\n";
echo json_encode($requestData, JSON_PRETTY_PRINT) . "\n\n";

// Create request object
$request = new Request();
$request->merge($requestData);

// Test the controller
$controller = new DeliveryPersonnelController();

try {
    $response = $controller->updateChatId($request, $person);
    $responseData = json_decode($response->getContent(), true);
    
    echo "📡 Response Status: " . $response->getStatusCode() . "\n";
    echo "📡 Response Data:\n";
    echo json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
    
    if ($response->getStatusCode() === 200) {
        echo "✅ SUCCESS! Frontend flow simulation worked\n";
        
        // Verify the update
        $person->refresh();
        echo "📱 Updated Chat ID: {$person->telegram_chat_id}\n";
        echo "👤 Updated Username: {$person->telegram_username}\n";
    } else {
        echo "❌ FAILED! Status: " . $response->getStatusCode() . "\n";
        if (isset($responseData['errors'])) {
            echo "Validation Errors:\n";
            foreach ($responseData['errors'] as $field => $errors) {
                echo "  {$field}: " . implode(', ', $errors) . "\n";
            }
        }
    }
} catch (\Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}

// Clean up
$person->delete();
echo "\n🧹 Cleaned up test data\n";
echo "🎯 Test completed!\n";