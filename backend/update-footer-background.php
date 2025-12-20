<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Updating Footer Background to White\n";
echo "===================================\n\n";

try {
    // Update the footer_background setting in the database
    $updated = DB::table('platform_settings')
        ->where('key', 'footer_background')
        ->update(['value' => '#ffffff']);

    if ($updated > 0) {
        echo "✅ Updated footer_background setting to white (#ffffff)\n";
    } else {
        echo "⚠️  No footer_background setting found in database\n";
        echo "Creating new footer_background setting...\n";
        
        DB::table('platform_settings')->insert([
            'key' => 'footer_background',
            'value' => '#ffffff',
            'type' => 'color',
            'group' => 'theme',
            'description' => 'Footer background color',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        echo "✅ Created new footer_background setting\n";
    }

    // Verify the change
    $setting = DB::table('platform_settings')
        ->where('key', 'footer_background')
        ->first();

    if ($setting) {
        echo "\nCurrent footer_background value: {$setting->value}\n";
    }

    echo "\n✅ Footer background update complete!\n";
    echo "\nNote: You may need to refresh the browser to see the changes.\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}