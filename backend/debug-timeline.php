<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Request::capture();
$response = $kernel->handle($request);

echo "Debugging Customer Timeline API...\n\n";

// Get a customer ID to test with
$customer = App\Models\User::where('role', '!=', 'admin')->first();

if (!$customer) {
    echo "❌ No customers found in database\n";
    exit(1);
}

echo "✅ Testing with customer: {$customer->name} (ID: {$customer->id})\n\n";

// Test the timeline endpoint with error handling
try {
    $controller = new App\Http\Controllers\Admin\CustomerController();
    
    echo "🔍 Checking customer data...\n";
    echo "   - Orders: " . $customer->orders()->count() . "\n";
    echo "   - Wishlist: " . $customer->wishlists()->count() . "\n";
    echo "   - Cart Items: " . $customer->cartItems()->count() . "\n\n";
    
    echo "🔍 Testing timeline method...\n";
    $response = $controller->getTimeline($customer->id);
    $statusCode = $response->getStatusCode();
    $content = $response->getContent();
    
    echo "   - Status Code: {$statusCode}\n";
    echo "   - Response: " . substr($content, 0, 200) . "...\n\n";
    
    if ($statusCode === 200) {
        $data = json_decode($content, true);
        if ($data && isset($data['success']) && $data['success']) {
            echo "✅ Timeline API working!\n";
            echo "📊 Events: " . count($data['data']['timeline']) . "\n";
        } else {
            echo "❌ API returned error: " . ($data['message'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "❌ HTTP Error {$statusCode}\n";
        echo "Response: {$content}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}