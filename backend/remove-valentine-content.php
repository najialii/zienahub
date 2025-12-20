<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Removing Valentine's Day Content\n";
echo "===============================\n\n";

try {
    // 1. Remove Valentine's Day banners
    echo "1. Removing Valentine's Day banners...\n";
    $deletedBanners = DB::table('banners')
        ->where('title_en', 'LIKE', '%Valentine%')
        ->orWhere('title_ar', 'LIKE', '%الحب%')
        ->orWhere('link_url', 'LIKE', '%valentine%')
        ->delete();
    
    echo "   Deleted $deletedBanners Valentine's Day banners\n";

    // 2. Check for Valentine's Day tags and make them inactive
    echo "\n2. Deactivating Valentine's Day tags...\n";
    $updatedTags = DB::table('tags')
        ->where('slug', 'valentines-day')
        ->orWhere('name_en', 'LIKE', '%Valentine%')
        ->update(['is_active' => false, 'is_featured' => false]);
    
    echo "   Deactivated $updatedTags Valentine's Day tags\n";

    // 3. Check current banners
    echo "\n3. Current active banners:\n";
    $activeBanners = DB::table('banners')
        ->where('is_active', true)
        ->get();
    
    foreach ($activeBanners as $banner) {
        echo "   - {$banner->title_en} (Type: {$banner->type})\n";
    }

    // 4. Check current featured tags
    echo "\n4. Current featured tags:\n";
    $featuredTags = DB::table('tags')
        ->where('is_featured', true)
        ->where('is_active', true)
        ->get();
    
    foreach ($featuredTags as $tag) {
        echo "   - {$tag->name_en} ({$tag->slug})\n";
    }

    echo "\n✅ Valentine's Day content removal complete!\n";
    echo "\nNote: If you still see Valentine's content, it might be:\n";
    echo "- Cached in the browser (try hard refresh)\n";
    echo "- Coming from product tags (products will still have valentine tags but won't be featured)\n";
    echo "- In static content that needs manual removal\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}