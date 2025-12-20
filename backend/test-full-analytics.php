<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Full Analytics Endpoint...\n\n";

// Get admin user
$user = App\Models\User::where('role', 'admin')->first();

if (!$user) {
    echo "No admin user found!\n";
    exit(1);
}

// Create token
$token = $user->createToken('test-token')->plainTextToken;

echo "Testing with admin user: {$user->email}\n\n";

// Test analytics endpoint
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/admin/analytics/dashboard?period=30');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n\n";

if ($httpCode === 200) {
    echo "✓ SUCCESS!\n\n";
    $data = json_decode($response, true);
    
    if (isset($data['data']['overview'])) {
        $overview = $data['data']['overview'];
        echo "Overview:\n";
        echo "  - Total Revenue: {$overview['total_revenue']} SAR\n";
        echo "  - Total Orders: {$overview['total_orders']}\n";
        echo "  - Avg Order Value: {$overview['avg_order_value']} SAR\n";
        echo "  - Total Customers: {$overview['total_customers']}\n";
        echo "  - New Customers: {$overview['new_customers']}\n";
    }
    
    if (isset($data['data']['products']['top_selling'])) {
        echo "\nTop Products:\n";
        foreach (array_slice($data['data']['products']['top_selling'], 0, 3) as $product) {
            echo "  - {$product['name']}: {$product['total_quantity']} sold\n";
        }
    }
    
    echo "\n✓ Analytics endpoint is working!\n";
} else {
    echo "✗ FAILED!\n\n";
    echo "Response:\n";
    echo $response . "\n";
}
