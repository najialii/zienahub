<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Checking Home Sections\n";
echo "=====================\n\n";

try {
    $sections = DB::table('home_sections')
        ->orderBy('sort_order')
        ->get();

    echo "Current home sections:\n";
    foreach ($sections as $section) {
        echo "- {$section->name} (Type: {$section->type}, Active: " . 
             ($section->is_active ? 'Yes' : 'No') . ")\n";
    }

    // Check if featured subcategories section exists
    $featuredSubcategoriesSection = DB::table('home_sections')
        ->where('type', 'featured_subcategories')
        ->first();

    if (!$featuredSubcategoriesSection) {
        echo "\nAdding Featured Subcategories section...\n";
        
        $maxSortOrder = DB::table('home_sections')->max('sort_order') ?? 0;
        
        DB::table('home_sections')->insert([
            'name' => 'featured_subcategories',
            'type' => 'featured_subcategories',
            'title_en' => 'Featured Collections',
            'title_ar' => 'المجموعات المميزة',
            'description_en' => 'Discover our handpicked collections',
            'description_ar' => 'اكتشف مجموعاتنا المختارة بعناية',
            'settings' => json_encode([]),
            'sort_order' => $maxSortOrder + 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        echo "✅ Featured Subcategories section added!\n";
    } else {
        echo "\n✅ Featured Subcategories section already exists!\n";
    }

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}