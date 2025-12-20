<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\DeliveryPerson;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\DeliveryPersonnelController;

echo "Testing Get Chat ID API\n";
echo "=======================\n\n";

// Get Khalid (who we know has a chat ID)
$person = DeliveryPerson::where('name', 'Khalid')->first();

if (!$person) {
    echo "❌ Khalid not found. Creating test person...\n";
    $person = DeliveryPerson::create([
        'name' => 'TestPerson',
        'phone' => '+966501234570',
        'telegram_chat_id' => null,
        'is_active' => true
    ]);
}

echo "📝 Testing get chat ID for: {$person->name} (ID: {$person->id})\n";
echo "📱 Current Chat ID: " . ($person->telegram_chat_id ?? 'None') . "\n\n";

// Create request object
$request = new Request();

// Test the controller
$controller = new DeliveryPersonnelController();

try {
    echo "🧪 Calling getChatId API...\n";
    $response = $controller->getChatId($person);
    $responseData = json_decode($response->getContent(), true);
    
    echo "📡 Response Status: " . $response->getStatusCode() . "\n";
    echo "📡 Response Data:\n";
    echo json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
    
    if ($response->getStatusCode() === 200 && isset($responseData['success']) && $responseData['success']) {
        echo "✅ SUCCESS! Found chat ID: {$responseData['chat_id']}\n";
    } else {
        echo "ℹ️  No matching chat ID found (this is normal if no one with that name sent /start recently)\n";
    }
} catch (\Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}

echo "\n🎯 Test completed!\n";