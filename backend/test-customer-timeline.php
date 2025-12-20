<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Request::capture();
$response = $kernel->handle($request);

// Test the customer timeline endpoint
echo "Testing Customer Timeline API...\n\n";

// Get a customer ID to test with
$customer = App\Models\User::where('role', '!=', 'admin')->first();

if (!$customer) {
    echo "❌ No customers found in database\n";
    exit(1);
}

echo "✅ Testing with customer: {$customer->name} (ID: {$customer->id})\n\n";

// Test the timeline endpoint
try {
    $controller = new App\Http\Controllers\Admin\CustomerController();
    $response = $controller->getTimeline($customer->id);
    $data = json_decode($response->getContent(), true);
    
    if ($data['success']) {
        echo "✅ Timeline API working successfully!\n";
        echo "📊 Timeline Stats:\n";
        echo "   - Total Events: {$data['data']['stats']['total_events']}\n";
        echo "   - Orders: {$data['data']['stats']['orders_count']}\n";
        echo "   - Wishlist Items: {$data['data']['stats']['wishlist_count']}\n";
        echo "   - Cart Items: {$data['data']['stats']['cart_items_count']}\n\n";
        
        echo "📅 Recent Timeline Events:\n";
        $events = array_slice($data['data']['timeline'], 0, 5);
        foreach ($events as $event) {
            $date = date('Y-m-d H:i', strtotime($event['created_at']));
            echo "   - [{$date}] {$event['title']}: {$event['description']}\n";
        }
        
    } else {
        echo "❌ Timeline API failed: {$data['message']}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error testing timeline: " . $e->getMessage() . "\n";
}

echo "\n🔗 Timeline URL: http://localhost:3000/ar/admin/customers/{$customer->id}\n";
echo "📱 API Endpoint: http://localhost:8000/api/admin/customers/{$customer->id}/timeline\n";