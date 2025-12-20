<?php

// Replace with your actual bot token
$botToken = '8280124229:AAE44ykbzEM4zoEtGwXyrdkgJC810Z0oIgg';

echo "Getting chat updates...\n";

$url = "https://api.telegram.org/bot{$botToken}/getUpdates";
$response = file_get_contents($url);
$data = json_decode($response, true);

if ($data['ok']) {
    echo "✅ Bot is working!\n\n";
    
    if (empty($data['result'])) {
        echo "No messages found. Please:\n";
        echo "1. Search for your bot in Telegram\n";
        echo "2. Send /start to your bot\n";
        echo "3. Send any message\n";
        echo "4. Run this script again\n";
    } else {
        echo "Recent messages:\n";
        foreach ($data['result'] as $update) {
            if (isset($update['message'])) {
                $chatId = $update['message']['chat']['id'];
                $firstName = $update['message']['from']['first_name'] ?? 'Unknown';
                $username = $update['message']['from']['username'] ?? 'No username';
                $text = $update['message']['text'] ?? 'No text';
                
                echo "---\n";
                echo "Chat ID: {$chatId}\n";
                echo "Name: {$firstName}\n";
                echo "Username: @{$username}\n";
                echo "Message: {$text}\n";
            }
        }
    }
} else {
    echo "❌ Error: " . $data['description'] . "\n";
    echo "Please check your bot token.\n";
}