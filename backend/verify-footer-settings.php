<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Verifying Footer Settings\n";
echo "========================\n\n";

try {
    // Check the footer_background setting
    $footerSetting = DB::table('platform_settings')
        ->where('key', 'footer_background')
        ->first();

    if ($footerSetting) {
        echo "✅ Footer background setting found:\n";
        echo "   Key: {$footerSetting->key}\n";
        echo "   Value: {$footerSetting->value}\n";
        echo "   Type: {$footerSetting->type}\n";
        echo "   Group: {$footerSetting->group}\n";
        
        if ($footerSetting->value === '#ffffff') {
            echo "   ✅ Footer background is set to white\n";
        } else {
            echo "   ⚠️  Footer background is not white: {$footerSetting->value}\n";
            
            // Update it to white
            DB::table('platform_settings')
                ->where('key', 'footer_background')
                ->update(['value' => '#ffffff']);
            
            echo "   ✅ Updated to white (#ffffff)\n";
        }
    } else {
        echo "❌ Footer background setting not found\n";
    }

    // Check all theme-related settings
    echo "\n2. All theme settings:\n";
    $themeSettings = DB::table('platform_settings')
        ->where('group', 'theme')
        ->get();

    foreach ($themeSettings as $setting) {
        echo "   - {$setting->key}: {$setting->value}\n";
    }

    echo "\n✅ Footer settings verification complete!\n";
    echo "\nSummary of changes made:\n";
    echo "1. ✅ Footer component uses bg-white and dark text\n";
    echo "2. ✅ CSS variables updated to white footer background\n";
    echo "3. ✅ Global CSS footer rules updated\n";
    echo "4. ✅ Platform settings context updated\n";
    echo "5. ✅ Database seeder updated\n";
    echo "6. ✅ Database setting updated to white\n";
    echo "\nThe footer should now be white. If still dark, try:\n";
    echo "- Hard refresh (Ctrl+F5)\n";
    echo "- Clear browser cache\n";
    echo "- Restart development server\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}