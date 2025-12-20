<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Cleaning Up Duplicate Banners\n";
echo "=============================\n\n";

try {
    // Get all banners grouped by title
    $banners = DB::table('banners')
        ->orderBy('id')
        ->get();

    echo "All banners:\n";
    foreach ($banners as $banner) {
        echo "- ID: {$banner->id}, Title: {$banner->title_en}, Type: {$banner->type}, Active: " . 
             ($banner->is_active ? 'Yes' : 'No') . "\n";
    }

    // Find duplicates by title
    $titleGroups = [];
    foreach ($banners as $banner) {
        if (!isset($titleGroups[$banner->title_en])) {
            $titleGroups[$banner->title_en] = [];
        }
        $titleGroups[$banner->title_en][] = $banner;
    }

    echo "\nRemoving duplicates...\n";
    foreach ($titleGroups as $title => $bannerList) {
        if (count($bannerList) > 1) {
            echo "Found " . count($bannerList) . " banners with title: $title\n";
            
            // Keep the first one, delete the rest
            $keepBanner = $bannerList[0];
            echo "  Keeping: ID {$keepBanner->id}\n";
            
            for ($i = 1; $i < count($bannerList); $i++) {
                $deleteBanner = $bannerList[$i];
                DB::table('banners')->where('id', $deleteBanner->id)->delete();
                echo "  Deleted: ID {$deleteBanner->id}\n";
            }
        }
    }

    // Final check
    echo "\nFinal banner list:\n";
    $finalBanners = DB::table('banners')
        ->where('is_active', true)
        ->orderBy('id')
        ->get();

    foreach ($finalBanners as $banner) {
        echo "- {$banner->title_en} (Type: {$banner->type})\n";
    }

    echo "\n✅ Banner cleanup complete!\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}