<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Cart;
use App\Models\Wishlist;

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing Enhanced Customer Timeline...\n\n";

try {
    // Find or create a test customer
    $customer = User::where('role', '!=', 'admin')->first();
    
    if (!$customer) {
        echo "No customers found. Creating test customer...\n";
        $customer = User::create([
            'name' => 'Test Customer',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);
    }
    
    echo "Testing timeline for customer: {$customer->name} (ID: {$customer->id})\n\n";
    
    // Create some test data if needed
    $product = Product::first();
    if ($product) {
        // Add to wishlist
        Wishlist::firstOrCreate([
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);
        
        // Add to cart
        Cart::updateOrCreate([
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ], [
            'quantity' => 2,
        ]);
        
        echo "Added test wishlist and cart items.\n\n";
    }
    
    // Test the timeline API endpoint
    $controller = new App\Http\Controllers\Admin\CustomerController();
    $response = $controller->getTimeline($customer->id);
    $data = json_decode($response->getContent(), true);
    
    if ($data['success']) {
        $timeline = $data['data']['timeline'];
        $stats = $data['data']['stats'];
        
        echo "Timeline Stats:\n";
        echo "- Total Events: {$stats['total_events']}\n";
        echo "- Orders Count: {$stats['orders_count']}\n";
        echo "- Wishlist Count: {$stats['wishlist_count']}\n";
        echo "- Total Spent: {$stats['total_spent']} SAR\n";
        echo "- Days Since Joined: {$stats['days_since_joined']}\n";
        echo "- Average Order Value: {$stats['average_order_value']} SAR\n";
        echo "- Delivered Orders: {$stats['delivered_orders']}\n";
        echo "- Pending Orders: {$stats['pending_orders']}\n";
        echo "- Cancelled Orders: {$stats['cancelled_orders']}\n\n";
        
        echo "Recent Timeline Events:\n";
        echo str_repeat("-", 50) . "\n";
        
        foreach (array_slice($timeline, 0, 10) as $event) {
            echo "Type: {$event['type']}\n";
            echo "Title: {$event['title']}\n";
            echo "Description: {$event['description']}\n";
            echo "Date: {$event['created_at']}\n";
            echo "Icon: {$event['icon']} | Color: {$event['color']}\n";
            
            if (!empty($event['data'])) {
                echo "Data: " . json_encode($event['data'], JSON_PRETTY_PRINT) . "\n";
            }
            
            echo str_repeat("-", 30) . "\n";
        }
        
        echo "\nTimeline test completed successfully!\n";
        echo "Total events in timeline: " . count($timeline) . "\n";
        
    } else {
        echo "Error: {$data['message']}\n";
        if (isset($data['error'])) {
            echo "Details: {$data['error']}\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}