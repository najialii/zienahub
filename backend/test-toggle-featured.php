<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Toggle Featured Functionality\n";
echo "====================================\n\n";

try {
    // Get a subcategory to test with
    $subcategory = DB::table('subcategories')
        ->leftJoin('subcategory_translations', function($join) {
            $join->on('subcategories.id', '=', 'subcategory_translations.subcategory_id')
                 ->where('subcategory_translations.locale', '=', 'en');
        })
        ->select('subcategories.*', 'subcategory_translations.name')
        ->first();

    if (!$subcategory) {
        echo "No subcategories found to test with.\n";
        exit(1);
    }

    echo "Testing with subcategory: {$subcategory->name} (ID: {$subcategory->id})\n";
    echo "Current featured status: " . ($subcategory->is_featured ? 'Yes' : 'No') . "\n";
    echo "Current sort order: " . ($subcategory->featured_sort_order ?? 'null') . "\n\n";

    // Test the toggle logic
    $newFeaturedStatus = !$subcategory->is_featured;
    $newSortOrder = null;
    
    if ($newFeaturedStatus) {
        // If becoming featured, get next sort order
        $maxSortOrder = DB::table('subcategories')
            ->where('is_featured', true)
            ->max('featured_sort_order');
        $newSortOrder = ($maxSortOrder ?? 0) + 1;
    }

    echo "Toggling to: " . ($newFeaturedStatus ? 'Featured' : 'Not Featured') . "\n";
    echo "New sort order: " . ($newSortOrder ?? 'null') . "\n\n";

    // Update the subcategory
    DB::table('subcategories')
        ->where('id', $subcategory->id)
        ->update([
            'is_featured' => $newFeaturedStatus,
            'featured_sort_order' => $newSortOrder
        ]);

    echo "✅ Toggle successful!\n\n";

    // Verify the change
    $updated = DB::table('subcategories')
        ->where('id', $subcategory->id)
        ->first();

    echo "Verification:\n";
    echo "- Featured status: " . ($updated->is_featured ? 'Yes' : 'No') . "\n";
    echo "- Sort order: " . ($updated->featured_sort_order ?? 'null') . "\n\n";

    // Show all featured subcategories
    echo "All featured subcategories:\n";
    $featured = DB::table('subcategories')
        ->leftJoin('subcategory_translations', function($join) {
            $join->on('subcategories.id', '=', 'subcategory_translations.subcategory_id')
                 ->where('subcategory_translations.locale', '=', 'en');
        })
        ->where('subcategories.is_featured', true)
        ->orderBy('subcategories.featured_sort_order')
        ->select('subcategories.*', 'subcategory_translations.name')
        ->get();

    foreach ($featured as $sub) {
        echo "- {$sub->name} (Sort: {$sub->featured_sort_order})\n";
    }

    // Restore original state
    echo "\nRestoring original state...\n";
    DB::table('subcategories')
        ->where('id', $subcategory->id)
        ->update([
            'is_featured' => $subcategory->is_featured,
            'featured_sort_order' => $subcategory->featured_sort_order
        ]);

    echo "✅ Original state restored!\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}