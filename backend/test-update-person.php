<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\DeliveryPerson;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\DeliveryPersonnelController;

echo "Testing Delivery Person Update\n";
echo "==============================\n\n";

// Get an existing delivery person
$person = DeliveryPerson::first();

if (!$person) {
    echo "❌ No delivery person found to test with\n";
    exit(1);
}

echo "📝 Testing update for: {$person->name} (ID: {$person->id})\n";
echo "📱 Current Chat ID: " . ($person->telegram_chat_id ?? 'None') . "\n\n";

// Create a test request
$requestData = [
    'name' => $person->name,
    'phone' => $person->phone,
    'telegram_chat_id' => '1234567890',
    'telegram_username' => '@test_user',
    'is_active' => true,
    'notes' => 'Test update'
];

echo "🧪 Testing update with data:\n";
echo json_encode($requestData, JSON_PRETTY_PRINT) . "\n\n";

// Create request object
$request = new Request();
$request->merge($requestData);

// Test the controller
$controller = new DeliveryPersonnelController();

try {
    $response = $controller->update($request, $person);
    $responseData = json_decode($response->getContent(), true);
    
    echo "📡 Response Status: " . $response->getStatusCode() . "\n";
    echo "📡 Response Data:\n";
    echo json_encode($responseData, JSON_PRETTY_PRINT) . "\n";
    
    if ($response->getStatusCode() === 200) {
        echo "✅ SUCCESS! Update worked\n";
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

echo "\n🎯 Test completed!\n";