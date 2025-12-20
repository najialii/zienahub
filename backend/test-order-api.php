<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;

echo "Testing Order API Response\n";
echo "=========================\n\n";

// Get the latest order with delivery person
$order = Order::with(['items.product', 'deliveryPerson'])->latest()->first();

if (!$order) {
    echo "❌ No orders found\n";
    exit(1);
}

echo "📦 Order: {$order->order_number}\n";
echo "📊 Status: {$order->status}\n";
echo "🚚 Delivery Person ID: " . ($order->delivery_person_id ?? 'None') . "\n";

if ($order->deliveryPerson) {
    echo "✅ Delivery Person: {$order->deliveryPerson->name}\n";
    echo "📞 Phone: {$order->deliveryPerson->phone}\n";
    echo "📅 Assigned At: " . ($order->assigned_at ? $order->assigned_at->format('Y-m-d H:i:s') : 'Not set') . "\n";
} else {
    echo "❌ No delivery person assigned\n";
}

echo "\n📡 API Response Structure:\n";
echo "==========================\n";

$apiResponse = [
    'id' => $order->id,
    'order_number' => $order->order_number,
    'status' => $order->status,
    'delivery_person_id' => $order->delivery_person_id,
    'delivery_person' => $order->deliveryPerson ? [
        'id' => $order->deliveryPerson->id,
        'name' => $order->deliveryPerson->name,
        'phone' => $order->deliveryPerson->phone,
    ] : null,
    'assigned_at' => $order->assigned_at,
];

echo json_encode($apiResponse, JSON_PRETTY_PRINT) . "\n";

echo "\n🎯 Test completed!\n";