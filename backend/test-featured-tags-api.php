<?php

// Simple test to check if featured tags API is working
$url = 'http://localhost:8000/api/tags/featured';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
echo "Response:\n";

if ($response) {
    $data = json_decode($response, true);
    if ($data) {
        if (isset($data['success']) && $data['success']) {
            $tags = $data['data'] ?? [];
            echo "Found " . count($tags) . " featured tags:\n";
            foreach ($tags as $tag) {
                echo "- {$tag['name_en']} ({$tag['name_ar']}) - Featured: " . ($tag['is_featured'] ? 'Yes' : 'No') . " - Active: " . ($tag['is_active'] ? 'Yes' : 'No') . "\n";
            }
        } else {
            echo "API returned error: " . ($data['message'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "Invalid JSON response\n";
    }
} else {
    echo "No response received\n";
}