<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\TelegramService;

echo "Testing Telegram Bot Connection...\n";

$service = new TelegramService();
$result = $service->testConnection();

if ($result['success']) {
    echo "✅ Bot connected successfully!\n";
    echo "Bot info: " . json_encode($result['bot_info'], JSON_PRETTY_PRINT) . "\n";
    
    // Test sending a message to mujahid
    echo "\nTesting message send to chat ID: 6275731163 (mujahid)\n";
    $testMessage = "🤖 Test message from BloomCart delivery system!\n\nHello mujahid! If you receive this, your Telegram integration is working! ✅";
    $sendResult = $service->sendMessage('6275731163', $testMessage);
    
    if ($sendResult) {
        echo "✅ Test message sent successfully!\n";
    } else {
        echo "❌ Failed to send test message\n";
    }
} else {
    echo "❌ Bot connection failed: " . $result['message'] . "\n";
}