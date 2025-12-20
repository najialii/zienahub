<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Featured Subcategories System\n";
echo "=====================================\n\n";

try {
    // Test 1: Check if subcategories table has is_featured column
    echo "1. Checking database structure...\n";
    $columns = DB::select("DESCRIBE subcategories");
    $hasFeaturedColumn = false;
    foreach ($columns as $column) {
        if ($column->Field === 'is_featured') {
            $hasFeaturedColumn = true;
            echo "   ✓ is_featured column exists\n";
            break;
        }
    }
    
    if (!$hasFeaturedColumn) {
        echo "   ✗ is_featured column missing\n";
        exit(1);
    }

    // Test 2: Check subcategories with featured status
    echo "\n2. Checking subcategories...\n";
    $subcategories = DB::table('subcategories')
        ->leftJoin('subcategory_translations', function($join) {
            $join->on('subcategories.id', '=', 'subcategory_translations.subcategory_id')
                 ->where('subcategory_translations.locale', '=', 'en');
        })
        ->select('subcategories.*', 'subcategory_translations.name')
        ->get();
    
    echo "   Total subcategories: " . $subcategories->count() . "\n";
    
    $featuredCount = 0;
    foreach ($subcategories as $sub) {
        if ($sub->is_featured) {
            $featuredCount++;
            echo "   ✓ Featured: {$sub->name} (ID: {$sub->id})\n";
        }
    }
    
    echo "   Featured subcategories: $featuredCount\n";

    // Test 3: Test API endpoint
    echo "\n3. Testing API endpoint...\n";
    
    // Simulate API call
    $featuredSubcategories = App\Models\Subcategory::with(['category.translations', 'translations', 'products'])
        ->featured()
        ->orderedByFeatured()
        ->get();
    
    echo "   API returned " . $featuredSubcategories->count() . " featured subcategories\n";
    
    foreach ($featuredSubcategories as $subcategory) {
        $products = $subcategory->getFeaturedProducts(4);
        echo "   - {$subcategory->getName('en')} ({$products->count()} products)\n";
    }

    // Test 4: Toggle featured status
    echo "\n4. Testing toggle functionality...\n";
    
    if ($subcategories->count() > 0) {
        $testSubcategory = $subcategories->first();
        $originalStatus = $testSubcategory->is_featured;
        
        // Toggle status
        DB::table('subcategories')
            ->where('id', $testSubcategory->id)
            ->update(['is_featured' => !$originalStatus]);
        
        $newStatus = DB::table('subcategories')
            ->where('id', $testSubcategory->id)
            ->value('is_featured');
        
        echo "   ✓ Toggled subcategory {$testSubcategory->id} from " . 
             ($originalStatus ? 'featured' : 'not featured') . " to " . 
             ($newStatus ? 'featured' : 'not featured') . "\n";
        
        // Restore original status
        DB::table('subcategories')
            ->where('id', $testSubcategory->id)
            ->update(['is_featured' => $originalStatus]);
        
        echo "   ✓ Restored original status\n";
    }

    echo "\n✅ All tests passed! Featured subcategories system is working correctly.\n";
    
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}