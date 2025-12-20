<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Final Home Sections Cleanup\n";
echo "===========================\n\n";

try {
    // Get all home sections
    $sections = DB::table('home_sections')
        ->orderBy('sort_order')
        ->get();

    echo "Current home sections:\n";
    foreach ($sections as $section) {
        echo "- ID: {$section->id}, Name: {$section->name}, Type: {$section->type}, Sort: {$section->sort_order}, Active: " . 
             ($section->is_active ? 'Yes' : 'No') . "\n";
    }

    // Check for any remaining duplicates by name
    echo "\nChecking for duplicates by name:\n";
    $nameGroups = [];
    foreach ($sections as $section) {
        if (!isset($nameGroups[$section->name])) {
            $nameGroups[$section->name] = [];
        }
        $nameGroups[$section->name][] = $section;
    }

    $hasDuplicates = false;
    foreach ($nameGroups as $name => $sectionList) {
        if (count($sectionList) > 1) {
            $hasDuplicates = true;
            echo "⚠️  DUPLICATE NAME: $name (" . count($sectionList) . " instances)\n";
            foreach ($sectionList as $section) {
                echo "   - ID: {$section->id}, Type: {$section->type}, Sort: {$section->sort_order}\n";
            }
            
            // Keep the first one, delete the rest
            $keepSection = $sectionList[0];
            echo "   Keeping: ID {$keepSection->id}\n";
            
            for ($i = 1; $i < count($sectionList); $i++) {
                $deleteSection = $sectionList[$i];
                DB::table('home_sections')->where('id', $deleteSection->id)->delete();
                echo "   Deleted: ID {$deleteSection->id}\n";
            }
        }
    }

    if (!$hasDuplicates) {
        echo "✅ No duplicates found by name\n";
    }

    // Ensure proper sort order
    echo "\nFixing sort order...\n";
    $cleanSections = DB::table('home_sections')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    $sortOrder = 1;
    foreach ($cleanSections as $section) {
        if ($section->sort_order != $sortOrder) {
            DB::table('home_sections')
                ->where('id', $section->id)
                ->update(['sort_order' => $sortOrder]);
            echo "Updated {$section->name} sort order to {$sortOrder}\n";
        }
        $sortOrder++;
    }

    // Final verification
    echo "\nFinal home sections structure:\n";
    $finalSections = DB::table('home_sections')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    foreach ($finalSections as $section) {
        echo "- {$section->sort_order}. {$section->name} ({$section->type})\n";
    }

    echo "\n✅ Home sections cleanup complete!\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}