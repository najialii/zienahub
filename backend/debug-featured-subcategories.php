<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Debugging Featured Subcategories\n";
echo "================================\n\n";

try {
    // Check subcategories table structure
    echo "1. Checking subcategories table structure:\n";
    $columns = DB::select("DESCRIBE subcategories");
    foreach ($columns as $column) {
        if (in_array($column->Field, ['is_featured', 'featured_sort_order'])) {
            echo "   ✓ {$column->Field}: {$column->Type} (Null: {$column->Null}, Default: {$column->Default})\n";
        }
    }

    // Check featured subcategories
    echo "\n2. Checking featured subcategories:\n";
    $featuredSubs = DB::table('subcategories')
        ->where('is_featured', true)
        ->orderBy('featured_sort_order')
        ->get();
    
    echo "   Found " . $featuredSubs->count() . " featured subcategories:\n";
    foreach ($featuredSubs as $sub) {
        echo "   - ID: {$sub->id}, Sort: {$sub->featured_sort_order}\n";
    }

    // Check subcategory translations
    echo "\n3. Checking subcategory translations:\n";
    foreach ($featuredSubs as $sub) {
        $translations = DB::table('subcategory_translations')
            ->where('subcategory_id', $sub->id)
            ->get();
        
        echo "   Subcategory ID {$sub->id}:\n";
        foreach ($translations as $trans) {
            echo "     - {$trans->locale}: {$trans->name}\n";
        }
    }

    // Test the API logic
    echo "\n4. Testing API logic:\n";
    $featuredSubcategories = App\Models\Subcategory::with(['category.translations', 'translations', 'products'])
        ->featured()
        ->orderedByFeatured()
        ->get();

    echo "   Model query returned " . $featuredSubcategories->count() . " subcategories\n";

    foreach ($featuredSubcategories as $subcategory) {
        echo "   - {$subcategory->getName('en')} (Category: " . 
             ($subcategory->category ? $subcategory->category->getName('en') : 'None') . ")\n";
        
        $products = $subcategory->getFeaturedProducts(4);
        echo "     Products: " . $products->count() . "\n";
        
        foreach ($products as $product) {
            echo "       * {$product->name} (\${$product->price})\n";
        }
    }

    // Test HTTP endpoint
    echo "\n5. Testing HTTP endpoint:\n";
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
        echo "   ⚠️  Could not test HTTP endpoint (server may not be running)\n";
    } else {
        $data = json_decode($response, true);
        if ($data && $data['success']) {
            echo "   ✅ HTTP endpoint working! Returned " . count($data['data']) . " subcategories\n";
            foreach ($data['data'] as $sub) {
                echo "     - {$sub['name']} (" . count($sub['products']) . " products)\n";
            }
        } else {
            echo "   ❌ HTTP endpoint error: " . ($data['message'] ?? 'Unknown error') . "\n";
            echo "   Response: " . substr($response, 0, 500) . "\n";
        }
    }

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}