<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Checking for Duplicate Home Sections\n";
echo "====================================\n\n";

try {
    $sections = DB::table('home_sections')
        ->orderBy('sort_order')
        ->get();

    echo "All home sections:\n";
    foreach ($sections as $section) {
        echo "- ID: {$section->id}, Name: {$section->name}, Type: {$section->type}, Sort: {$section->sort_order}, Active: " . 
             ($section->is_active ? 'Yes' : 'No') . "\n";
    }

    // Check for duplicates by type
    echo "\nChecking for duplicates by type:\n";
    $typeGroups = [];
    foreach ($sections as $section) {
        if (!isset($typeGroups[$section->type])) {
            $typeGroups[$section->type] = [];
        }
        $typeGroups[$section->type][] = $section;
    }

    foreach ($typeGroups as $type => $sectionList) {
        if (count($sectionList) > 1) {
            echo "⚠️  DUPLICATE TYPE: $type (" . count($sectionList) . " instances)\n";
            foreach ($sectionList as $section) {
                echo "   - ID: {$section->id}, Name: {$section->name}\n";
            }
        }
    }

    // Clean up duplicates
    echo "\nCleaning up duplicates...\n";
    foreach ($typeGroups as $type => $sectionList) {
        if (count($sectionList) > 1) {
            // Keep the first one, delete the rest
            $keepSection = $sectionList[0];
            echo "Keeping: ID {$keepSection->id} ({$keepSection->name})\n";
            
            for ($i = 1; $i < count($sectionList); $i++) {
                $deleteSection = $sectionList[$i];
                DB::table('home_sections')->where('id', $deleteSection->id)->delete();
                echo "Deleted: ID {$deleteSection->id} ({$deleteSection->name})\n";
            }
        }
    }

    echo "\n✅ Cleanup complete!\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}