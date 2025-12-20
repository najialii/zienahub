<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Featured Tags Display\n";
echo "=============================\n\n";

try {
    // Test the featured tags API
    echo "1. Testing featured tags API...\n";
    
    $url = 'http://localhost:8000/api/tags/featured';
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'Accept: application/json',
                'Accept-Language: ar'
            ],
            'timeout' => 10
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "   ⚠️  Could not test HTTP endpoint (server may not be running)\n";
        echo "   Please start the server with: php artisan serve\n\n";
    } else {
        $data = json_decode($response, true);
        
        if ($data && isset($data['data'])) {
            echo "   ✅ API working! Returned " . count($data['data']) . " featured tags\n\n";
            
            echo "2. Featured tags details:\n";
            foreach ($data['data'] as $tag) {
                echo "   📌 {$tag['name_en']} / {$tag['name_ar']}\n";
                echo "      - Slug: {$tag['slug']}\n";
                echo "      - Type: {$tag['type']}\n";
                echo "      - Color: {$tag['color']}\n";
                echo "      - Icon: " . ($tag['icon'] ?? 'None') . "\n";
                echo "      - Active: " . ($tag['is_active'] ? 'Yes' : 'No') . "\n";
                echo "      - Featured: " . ($tag['is_featured'] ? 'Yes' : 'No') . "\n\n";
            }
        } else {
            echo "   ❌ API error or unexpected response\n";
            echo "   Response: " . substr($response, 0, 500) . "\n";
        }
    }

    // Direct database check
    echo "3. Direct database check:\n";
    $featuredTags = DB::table('tags')
        ->where('is_featured', true)
        ->where('is_active', true)
        ->orderBy('name_en')
        ->get();

    echo "   Found " . $featuredTags->count() . " featured tags in database:\n";
    foreach ($featuredTags as $tag) {
        echo "   - {$tag->name_en} / {$tag->name_ar} ({$tag->type})\n";
    }

    echo "\n✅ Featured tags test complete!\n";
    echo "\nExpected display in Arabic:\n";
    echo "- عيد الأم (occasion)\n";
    echo "- عيد الأب (occasion)\n";
    echo "- عيد ميلاد (occasion)\n";
    echo "- أم (giftee)\n";
    echo "- أب (giftee)\n";
    echo "- زوجة (giftee)\n";
    echo "- زوج (giftee)\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}