<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Http\Controllers\Admin\PromoCodeController;
use Illuminate\Http\Request;

echo "Testing Admin Promo Code Access\n";
echo "===============================\n\n";

$controller = new PromoCodeController();

// Test 1: Get all promo codes
echo "🧪 Test 1: Get all promo codes\n";
$request = new Request();
$response = $controller->index($request);
$data = json_decode($response->getContent(), true);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Promo codes found: " . count($data['data']['data'] ?? []) . "\n\n";

// Test 2: Get statistics
echo "🧪 Test 2: Get promo code statistics\n";
$response = $controller->getStats();
$data = json_decode($response->getContent(), true);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Stats: " . json_encode($data['data'], JSON_PRETTY_PRINT) . "\n\n";

// Test 3: Generate a new code
echo "🧪 Test 3: Generate new promo code\n";
$response = $controller->generateCode();
$data = json_decode($response->getContent(), true);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Generated code: " . ($data['code'] ?? 'None') . "\n\n";

echo "🎯 Admin promo code access test completed!\n";
echo "\nAdmin should now be able to:\n";
echo "1. Access /admin/promo-codes in the navigation\n";
echo "2. View all existing promo codes\n";
echo "3. Create, edit, and delete codes\n";
echo "4. View usage statistics\n";