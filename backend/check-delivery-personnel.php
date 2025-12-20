<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\DeliveryPerson;

echo "Current Delivery Personnel:\n";
echo "==========================\n";

$personnel = DeliveryPerson::all();

foreach ($personnel as $person) {
    echo "Name: {$person->name}\n";
    echo "Phone: {$person->phone}\n";
    echo "Chat ID: {$person->telegram_chat_id}\n";
    echo "Active: " . ($person->is_active ? 'Yes' : 'No') . "\n";
    echo "Created: {$person->created_at}\n";
    echo "---\n";
}

echo "\nTotal: " . $personnel->count() . " delivery personnel\n";