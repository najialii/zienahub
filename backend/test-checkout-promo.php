<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\PromoCodeController;
use App\Http\Controllers\OrderController;
use Illuminate\Http\Request;

echo "Testing Checkout Promo Code Integration\n";
echo "======================================\n\n";

$promoController = new PromoCodeController();
$orderController = new OrderController();

// Test 1: Validate promo code for checkout
echo "🧪 Test 1: Validate WELCOME10 for checkout (100 SAR order)\n";
$request = new Request([
    'code' => 'WELCOME10',
    'subtotal' => 100,
    'items' => [
        ['product_id' => 1, 'quantity' => 1, 'price' => 100]
    ],
    'user_email' => 'checkout@example.com'
]);

$response = $promoController->validateCode($request);
$data = json_decode($response->getContent(), true);

echo "Status: " . $response->getStatusCode() . "\n";
if ($data['success']) {
    echo "✅ Promo code valid!\n";
    echo "Discount: {$data['data']['discount_amount']} SAR\n";
    echo "New Total: {$data['data']['new_total']} SAR\n";
} else {
    echo "❌ Promo code invalid: {$data['message']}\n";
}
echo "\n";

// Test 2: Auto-apply for checkout
echo "🧪 Test 2: Auto-apply for 350 SAR order\n";
$request = new Request([
    'subtotal' => 350,
    'items' => [
        ['product_id' => 1, 'quantity' => 1, 'price' => 350]
    ],
    'user_email' => 'checkout@example.com'
]);

$response = $promoController->getAutoApply($request);
$data = json_decode($response->getContent(), true);

echo "Status: " . $response->getStatusCode() . "\n";
if ($data['success']) {
    echo "✅ Auto-apply code found!\n";
    echo "Code: {$data['data']['promo_code']['code']}\n";
    echo "Discount: {$data['data']['discount_amount']} SAR\n";
    echo "New Total: {$data['data']['new_total']} SAR\n";
} else {
    echo "ℹ️  No auto-apply codes available\n";
}
echo "\n";

// Test 3: Create order with promo code
echo "🧪 Test 3: Create order with promo code\n";
$orderRequest = new Request([
    'items' => [
        ['product_id' => 1, 'quantity' => 1, 'price' => 100]
    ],
    'total' => 90, // After 10% discount
    'subtotal' => 100,
    'discount_amount' => 10,
    'promo_code' => 'WELCOME10',
    'shipping_name' => 'Test Customer',
    'shipping_email' => 'test@example.com',
    'shipping_phone' => '+966501234567',
    'shipping_address' => '123 Test St',
    'shipping_city' => 'Riyadh',
    'shipping_postal_code' => '12345',
    'shipping_country' => 'Saudi Arabia'
]);

try {
    $response = $orderController->store($orderRequest);
    $data = json_decode($response->getContent(), true);
    
    echo "Status: " . $response->getStatusCode() . "\n";
    if ($response->getStatusCode() === 201) {
        echo "✅ Order created successfully!\n";
        echo "Order Number: {$data['order']['order_number']}\n";
        echo "Total: {$data['order']['total_amount']} SAR\n";
        echo "Discount: {$data['order']['discount_amount']} SAR\n";
        echo "Promo Code: {$data['order']['promo_code']}\n";
    } else {
        echo "❌ Order creation failed: " . ($data['message'] ?? 'Unknown error') . "\n";
    }
} catch (\Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}

echo "\n🎯 Checkout promo code integration test completed!\n";
echo "\nThe checkout page should now:\n";
echo "1. Show promo code input field\n";
echo "2. Validate codes in real-time\n";
echo "3. Auto-apply best available discounts\n";
echo "4. Display discount in order summary\n";
echo "5. Include promo code data in order creation\n";