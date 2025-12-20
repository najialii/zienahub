<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Request::capture();
$response = $kernel->handle($request);

echo "Creating Sample Timeline Data...\n\n";

// Get a customer to work with
$customer = App\Models\User::where('role', '!=', 'admin')->first();

if (!$customer) {
    echo "❌ No customers found\n";
    exit(1);
}

echo "✅ Working with customer: {$customer->name} (ID: {$customer->id})\n\n";

// Get some products
$products = App\Models\Product::limit(5)->get();

if ($products->count() === 0) {
    echo "❌ No products found\n";
    exit(1);
}

echo "📦 Found {$products->count()} products to work with\n\n";

try {
    // Create some wishlist items
    echo "💖 Creating wishlist items...\n";
    foreach ($products->take(3) as $product) {
        $wishlist = App\Models\Wishlist::firstOrCreate([
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);
        
        if ($wishlist->wasRecentlyCreated) {
            echo "   ✅ Added {$product->name} to wishlist\n";
        } else {
            echo "   ℹ️  {$product->name} already in wishlist\n";
        }
    }

    // Create some cart items
    echo "\n🛒 Creating cart items...\n";
    foreach ($products->take(2) as $product) {
        $cartItem = App\Models\Cart::firstOrCreate([
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ], [
            'product_name' => $product->name,
            'product_slug' => $product->slug,
            'product_price' => $product->price,
            'product_image_url' => $product->image_url,
            'product_sku' => $product->sku,
            'quantity' => rand(1, 3),
        ]);
        
        if ($cartItem->wasRecentlyCreated) {
            echo "   ✅ Added {$product->name} to cart (qty: {$cartItem->quantity})\n";
        } else {
            echo "   ℹ️  {$product->name} already in cart\n";
        }
    }

    // Create a sample order
    echo "\n📋 Creating sample order...\n";
    $orderNumber = 'ORD-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    $order = App\Models\Order::create([
        'user_id' => $customer->id,
        'order_number' => $orderNumber,
        'total_amount' => 150.00,
        'subtotal_amount' => 150.00,
        'status' => 'pending',
        'shipping_name' => $customer->name,
        'shipping_email' => $customer->email,
        'shipping_phone' => '+966501234567',
        'shipping_address' => 'Sample Address, Riyadh',
        'shipping_city' => 'Riyadh',
        'shipping_postal_code' => '12345',
        'shipping_country' => 'Saudi Arabia',
        'delivery_notes' => 'Sample delivery notes',
    ]);

    // Add order items
    foreach ($products->take(2) as $product) {
        App\Models\OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => rand(1, 2),
            'price_at_purchase' => $product->price,
        ]);
    }

    echo "   ✅ Created order #{$order->id} with {$products->take(2)->count()} items\n";

    echo "\n🎉 Sample data created successfully!\n";
    echo "🔗 View timeline at: http://localhost:3000/ar/admin/customers/{$customer->id}\n";

} catch (Exception $e) {
    echo "❌ Error creating sample data: " . $e->getMessage() . "\n";
}