<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Final Valentine's Day Content Check\n";
echo "==================================\n\n";

try {
    // Check banners
    echo "1. Checking banners for Valentine's content...\n";
    $valentineBanners = DB::table('banners')
        ->where('title_en', 'LIKE', '%Valentine%')
        ->orWhere('title_ar', 'LIKE', '%الحب%')
        ->orWhere('description_en', 'LIKE', '%Valentine%')
        ->orWhere('link_url', 'LIKE', '%valentine%')
        ->get();
    
    if ($valentineBanners->count() > 0) {
        echo "   ⚠️  Found " . $valentineBanners->count() . " Valentine's banners still active\n";
        foreach ($valentineBanners as $banner) {
            echo "      - {$banner->title_en}\n";
        }
    } else {
        echo "   ✅ No Valentine's banners found\n";
    }

    // Check tags
    echo "\n2. Checking tags for Valentine's content...\n";
    $valentineTags = DB::table('tags')
        ->where('is_active', true)
        ->where(function($query) {
            $query->where('slug', 'valentines-day')
                  ->orWhere('name_en', 'LIKE', '%Valentine%')
                  ->orWhere('name_ar', 'LIKE', '%الحب%');
        })
        ->get();
    
    if ($valentineTags->count() > 0) {
        echo "   ⚠️  Found " . $valentineTags->count() . " active Valentine's tags\n";
        foreach ($valentineTags as $tag) {
            echo "      - {$tag->name_en} ({$tag->slug})\n";
        }
    } else {
        echo "   ✅ No active Valentine's tags found\n";
    }

    // Check featured tags
    echo "\n3. Checking featured tags...\n";
    $featuredTags = DB::table('tags')
        ->where('is_featured', true)
        ->where('is_active', true)
        ->get();
    
    echo "   Current featured tags:\n";
    foreach ($featuredTags as $tag) {
        echo "      - {$tag->name_en} ({$tag->slug})\n";
    }

    // Check active banners
    echo "\n4. Current active banners:\n";
    $activeBanners = DB::table('banners')
        ->where('is_active', true)
        ->get();
    
    foreach ($activeBanners as $banner) {
        echo "   - {$banner->title_en} (Type: {$banner->type})\n";
    }

    echo "\n✅ Valentine's Day content check complete!\n";
    echo "\nIf you still see Valentine's content on the home page:\n";
    echo "1. Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)\n";
    echo "2. Check if there are any cached API responses\n";
    echo "3. Restart the frontend development server\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}