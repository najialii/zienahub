<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Setting up Featured Subcategories\n";
echo "=================================\n\n";

try {
    // Get some subcategories to feature
    $subcategories = DB::table('subcategories')
        ->leftJoin('subcategory_translations', function($join) {
            $join->on('subcategories.id', '=', 'subcategory_translations.subcategory_id')
                 ->where('subcategory_translations.locale', '=', 'en');
        })
        ->select('subcategories.*', 'subcategory_translations.name')
        ->limit(4)
        ->get();

    if ($subcategories->count() === 0) {
        echo "No subcategories found. Please create some subcategories first.\n";
        exit(1);
    }

    echo "Making the first 4 subcategories featured:\n\n";

    $sortOrder = 1;
    foreach ($subcategories as $subcategory) {
        DB::table('subcategories')
            ->where('id', $subcategory->id)
            ->update([
                'is_featured' => true,
                'featured_sort_order' => $sortOrder
            ]);

        echo "✓ Featured: {$subcategory->name} (Sort order: $sortOrder)\n";
        $sortOrder++;
    }

    echo "\n✅ Featured subcategories setup complete!\n";
    echo "\nYou can now:\n";
    echo "1. Visit the admin categories page to toggle featured status\n";
    echo "2. View featured subcategories on the home page\n";
    echo "3. Each featured subcategory will show up to 4 products\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}