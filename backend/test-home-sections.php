<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

echo "Testing Home Sections API...\n";

try {
    // Create a mock request to the home sections endpoint
    $request = Request::create('/api/home-sections', 'GET');
    $response = $kernel->handle($request);
    
    echo "Status Code: " . $response->getStatusCode() . "\n";
    echo "Response: " . $response->getContent() . "\n";
    
    $data = json_decode($response->getContent(), true);
    
    if ($data && isset($data['data'])) {
        echo "✅ Found " . count($data['data']) . " home sections\n";
        
        foreach ($data['data'] as $section) {
            echo "- " . $section['name'] . " (" . $section['type'] . ") - " . ($section['is_active'] ? 'Active' : 'Inactive') . "\n";
        }
    } else {
        echo "❌ No home sections found or invalid response\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\nTest complete!\n";