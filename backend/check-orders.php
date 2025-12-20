<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;

echo "Recent Orders with Delivery Status:\n";
echo "===================================\n";

$orders = Order::with('deliveryPerson')
    ->latest()
    ->take(10)
    ->get();

foreach ($orders as $order) {
    echo "Order: {$order->order_number}\n";
    echo "Status: {$order->status}\n";
    echo "Delivery Person: " . ($order->deliveryPerson ? $order->deliveryPerson->name : 'None') . "\n";
    echo "Assigned At: " . ($order->assigned_at ?? 'Not assigned') . "\n";
    echo "Created: {$order->created_at}\n";
    echo "---\n";
}

echo "\nTotal orders: " . $orders->count() . "\n";