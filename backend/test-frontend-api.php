<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Frontend API Calls\n";
echo "==========================\n\n";

try {
    // Test the featured subcategories endpoint
    echo "1. Testing /api/subcategories/featured endpoint:\n";
    
    $url = 'http://localhost:8000/api/subcategories/featured';
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'Accept: application/json',
                'Content-Type: application/json'
            ],
            'timeout' => 10
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "   ❌ Could not reach endpoint (server may not be running)\n";
        echo "   Please start the server with: php artisan serve\n\n";
    } else {
        $data = json_decode($response, true);
        
        if ($data && isset($data['success']) && $data['success']) {
            echo "   ✅ Endpoint working correctly\n";
            echo "   Response structure:\n";
            echo "   - Success: " . ($data['success'] ? 'true' : 'false') . "\n";
            echo "   - Data count: " . count($data['data']) . "\n";
            
            foreach ($data['data'] as $index => $subcategory) {
                echo "   - Subcategory " . ($index + 1) . ": {$subcategory['name']} (" . count($subcategory['products']) . " products)\n";
            }
        } else {
            echo "   ❌ API returned error:\n";
            echo "   Response: " . substr($response, 0, 500) . "\n";
        }
    }

    // Test the admin subcategories endpoint
    echo "\n2. Testing /api/admin/subcategories endpoint:\n";
    
    $adminUrl = 'http://localhost:8000/api/admin/subcategories';
    $adminContext = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'Accept: application/json',
                'Content-Type: application/json',
                'Authorization: Bearer test-token' // This will fail but we can see the structure
            ],
            'timeout' => 10
        ]
    ]);
    
    $adminResponse = @file_get_contents($adminUrl, false, $adminContext);
    
    if ($adminResponse === false) {
        echo "   ❌ Could not reach admin endpoint\n";
    } else {
        $adminData = json_decode($adminResponse, true);
        
        if ($adminData) {
            echo "   Response received (may be auth error, but structure is good)\n";
            echo "   Response preview: " . substr($adminResponse, 0, 200) . "...\n";
        }
    }

    // Test direct database query
    echo "\n3. Testing direct database query:\n";
    
    $featuredCount = \Illuminate\Support\Facades\DB::table('subcategories')
        ->where('is_featured', true)
        ->count();
    
    echo "   Featured subcategories in database: $featuredCount\n";
    
    if ($featuredCount > 0) {
        $featured = \Illuminate\Support\Facades\DB::table('subcategories')
            ->leftJoin('subcategory_translations', function($join) {
                $join->on('subcategories.id', '=', 'subcategory_translations.subcategory_id')
                     ->where('subcategory_translations.locale', '=', 'en');
            })
            ->where('subcategories.is_featured', true)
            ->orderBy('subcategories.featured_sort_order')
            ->select('subcategories.*', 'subcategory_translations.name')
            ->get();
        
        foreach ($featured as $sub) {
            echo "   - {$sub->name} (ID: {$sub->id}, Sort: {$sub->featured_sort_order})\n";
        }
    }

    echo "\n✅ All tests completed!\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}