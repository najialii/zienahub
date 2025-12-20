<?php

require_once 'vendor/autoload.php';

use App\Models\PlatformSetting;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check setting with ID 18
$setting = PlatformSetting::find(18);

if ($setting) {
    echo "Setting ID 18:\n";
    echo "Key: " . $setting->key . "\n";
    echo "Value: " . ($setting->value ?? 'NULL') . "\n";
    echo "Group: " . $setting->group . "\n";
    echo "Type: " . $setting->type . "\n";
} else {
    echo "Setting with ID 18 not found\n";
}

// Also check all settings to see which ones might have null values
echo "\nAll settings:\n";
$allSettings = PlatformSetting::all();
foreach ($allSettings as $s) {
    echo "ID: {$s->id}, Key: {$s->key}, Value: " . ($s->value ?? 'NULL') . ", Group: {$s->group}\n";
}