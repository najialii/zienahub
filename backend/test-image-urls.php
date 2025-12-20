<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Image URL Generation\n";
echo "============================\n\n";

try {
    // Test the featured subcategories API response
    $url = 'http://localhost:8000/api/subcategories/featured';
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => 'Accept: application/json',
            'timeout' => 10
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ Could not reach API endpoint\n";
        echo "Please make sure the backend server is running: php artisan serve\n";
        exit(1);
    }

    $data = json_decode($response, true);
    
    if (!$data || !$data['success']) {
        echo "❌ API returned error\n";
        exit(1);
    }

    echo "✅ API Response received successfully\n\n";
    
    echo "Image URLs from API:\n";
    echo "===================\n\n";
    
    foreach ($data['data'] as $subcategory) {
        echo "📁 {$subcategory['name']}\n";
        
        foreach ($subcategory['products'] as $product) {
            echo "   📦 {$product['name']}\n";
            echo "      - API Image URL: " . ($product['image_url'] ?: 'NULL') . "\n";
            
            // Show what the frontend should generate
            $backendBase = 'http://localhost:8000';
            $fullImageUrl = '';
            
            if ($product['image_url']) {
                if (str_starts_with($product['image_url'], 'http')) {
                    $fullImageUrl = $product['image_url'];
                } else {
                    $fullImageUrl = $backendBase . $product['image_url'];
                }
            }
            
            echo "      - Full Image URL: $fullImageUrl\n";
            
            // Test if the image is accessible
            if ($fullImageUrl) {
                $imageContext = stream_context_create([
                    'http' => [
                        'method' => 'HEAD',
                        'timeout' => 5
                    ]
                ]);
                
                $headers = @get_headers($fullImageUrl, 1, $imageContext);
                if ($headers && strpos($headers[0], '200') !== false) {
                    echo "      - Image accessible: ✅ YES\n";
                } else {
                    echo "      - Image accessible: ❌ NO\n";
                }
            }
            echo "\n";
        }
        echo "\n";
    }

    echo "Frontend Environment Variables:\n";
    echo "==============================\n";
    echo "NEXT_PUBLIC_API_URL should be: http://localhost:8000/api\n";
    echo "Backend base URL should be: http://localhost:8000\n\n";
    
    echo "Expected frontend image URL transformation:\n";
    echo "==========================================\n";
    echo "API returns: /storage/images/products/T68-3.jpg\n";
    echo "Frontend should generate: http://localhost:8000/storage/images/products/T68-3.jpg\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}