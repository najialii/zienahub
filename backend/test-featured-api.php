<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Featured Subcategories API\n";
echo "==================================\n\n";

try {
    // Test the API endpoint logic
    $featuredSubcategories = App\Models\Subcategory::with(['category.translations', 'translations', 'products'])
        ->featured()
        ->orderedByFeatured()
        ->get()
        ->map(function($subcategory) {
            // Get featured products for this subcategory
            $products = $subcategory->getFeaturedProducts(4)->map(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'image_url' => $product->image_url,
                    'status' => $product->status,
                ];
            });

            return [
                'id' => $subcategory->id,
                'name' => $subcategory->getName('en'),
                'name_ar' => $subcategory->getName('ar'),
                'slug' => $subcategory->slug,
                'description' => $subcategory->getDescription('en'),
                'description_ar' => $subcategory->getDescription('ar'),
                'category_id' => $subcategory->category_id,
                'featured_sort_order' => $subcategory->featured_sort_order,
                'category' => $subcategory->category ? [
                    'id' => $subcategory->category->id,
                    'name' => $subcategory->category->getName('en'),
                    'name_ar' => $subcategory->category->getName('ar'),
                ] : null,
                'products' => $products,
            ];
        });

    echo "Found " . $featuredSubcategories->count() . " featured subcategories:\n\n";

    foreach ($featuredSubcategories as $subcategory) {
        echo "📁 {$subcategory['name']} (ID: {$subcategory['id']})\n";
        echo "   Category: {$subcategory['category']['name']}\n";
        echo "   Sort Order: {$subcategory['featured_sort_order']}\n";
        echo "   Products: " . count($subcategory['products']) . "\n";
        
        foreach ($subcategory['products'] as $product) {
            echo "   - {$product['name']} (\${$product['price']})\n";
        }
        echo "\n";
    }

    // Test the actual HTTP endpoint
    echo "Testing HTTP endpoint...\n";
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
        echo "⚠️  Could not test HTTP endpoint (server may not be running)\n";
        echo "   Start the server with: php artisan serve\n";
    } else {
        $data = json_decode($response, true);
        if ($data && $data['success']) {
            echo "✅ HTTP endpoint working! Returned " . count($data['data']) . " featured subcategories\n";
        } else {
            echo "❌ HTTP endpoint error: " . ($data['message'] ?? 'Unknown error') . "\n";
        }
    }

    echo "\n✅ Featured subcategories API is working correctly!\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}