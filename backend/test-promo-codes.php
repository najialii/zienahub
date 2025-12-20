<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\PromoCodeController;
use Illuminate\Http\Request;

echo "Testing Promo Code System\n";
echo "=========================\n\n";

$controller = new PromoCodeController();

// Test 1: Valid percentage promo code
echo "🧪 Test 1: WELCOME10 (10% off, min 50 SAR)\n";
$request = new Request([
    'code' => 'WELCOME10',
    'subtotal' => 100,
    'user_email' => 'test@example.com'
]);

$response = $controller->validateCode($request);
$data = json_decode($response->getContent(), true);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

// Test 2: Fixed amount promo code
echo "🧪 Test 2: SAVE50 (50 SAR off, min 200 SAR)\n";
$request = new Request([
    'code' => 'SAVE50',
    'subtotal' => 250,
    'user_email' => 'test@example.com'
]);

$response = $controller->validateCode($request);
$data = json_decode($response->getContent(), true);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

// Test 3: Invalid code
echo "🧪 Test 3: Invalid code\n";
$request = new Request([
    'code' => 'INVALID123',
    'subtotal' => 100,
    'user_email' => 'test@example.com'
]);

$response = $controller->validateCode($request);
$data = json_decode($response->getContent(), true);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

// Test 4: Auto-apply codes
echo "🧪 Test 4: Auto-apply codes (300 SAR order)\n";
$request = new Request([
    'subtotal' => 300,
    'user_email' => 'test@example.com'
]);

$response = $controller->getAutoApply($request);
$data = json_decode($response->getContent(), true);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

// Test 5: Below minimum amount
echo "🧪 Test 5: WELCOME10 with amount below minimum (30 SAR)\n";
$request = new Request([
    'code' => 'WELCOME10',
    'subtotal' => 30,
    'user_email' => 'test@example.com'
]);

$response = $controller->validateCode($request);
$data = json_decode($response->getContent(), true);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

echo "🎯 Promo code testing completed!\n";