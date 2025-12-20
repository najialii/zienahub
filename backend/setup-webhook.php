<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\TelegramService;

echo "Setting up Telegram Webhook...\n";
echo "==============================\n\n";

$telegramService = new TelegramService();

// Set webhook URL (you'll need to replace this with your actual domain)
$webhookUrl = 'https://your-domain.com/api/telegram/webhook';

// For local testing, you can use ngrok or similar service
// Example: https://abc123.ngrok.io/api/telegram/webhook

echo "Setting webhook URL: {$webhookUrl}\n";

$result = $telegramService->setWebhook($webhookUrl);

if ($result && isset($result['ok']) && $result['ok']) {
    echo "✅ Webhook set successfully!\n";
    echo "Description: " . ($result['description'] ?? 'No description') . "\n";
} else {
    echo "❌ Failed to set webhook\n";
    echo "Response: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
}

echo "\n📝 Note: For local testing, you need to:\n";
echo "1. Use ngrok or similar service to expose your local server\n";
echo "2. Update the webhook URL above with your ngrok URL\n";
echo "3. Make sure your Laravel app is running on the correct port\n";