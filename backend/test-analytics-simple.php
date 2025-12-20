<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

echo "Testing Analytics Queries...\n\n";

// Test 1: Check order_items table structure
echo "1. Order Items Table Structure:\n";
$columns = DB::select("DESCRIBE order_items");
foreach ($columns as $col) {
    echo "  - {$col->Field} ({$col->Type})\n";
}

// Test 2: Check if we have any orders
echo "\n2. Total Orders: ";
$orderCount = DB::table('orders')->count();
echo "$orderCount\n";

// Test 3: Check if we have any order items
echo "\n3. Total Order Items: ";
$itemCount = DB::table('order_items')->count();
echo "$itemCount\n";

// Test 4: Try the product analytics query
echo "\n4. Testing Product Analytics Query:\n";
try {
    $startDate = Carbon::now()->subDays(30);
    $topProducts = DB::table('order_items')
        ->join('orders', 'order_items.order_id', '=', 'orders.id')
        ->join('products', 'order_items.product_id', '=', 'products.id')
        ->join('product_translations', function($join) {
            $join->on('products.id', '=', 'product_translations.product_id')
                 ->where('product_translations.locale', '=', 'en');
        })
        ->where('orders.created_at', '>=', $startDate)
        ->select(
            'products.id',
            'product_translations.name',
            'products.slug',
            DB::raw('SUM(order_items.quantity) as total_quantity'),
            DB::raw('SUM(order_items.quantity * order_items.price_at_purchase) as total_revenue'),
            DB::raw('COUNT(DISTINCT orders.id) as order_count')
        )
        ->groupBy('products.id', 'product_translations.name', 'products.slug')
        ->orderByDesc('total_revenue')
        ->limit(10)
        ->get();
    
    echo "  Success! Found " . count($topProducts) . " products\n";
    foreach ($topProducts as $product) {
        echo "  - {$product->name}: {$product->total_quantity} sold, {$product->total_revenue} SAR\n";
    }
} catch (\Exception $e) {
    echo "  Error: " . $e->getMessage() . "\n";
}

echo "\nDone!\n";
