<?php

use App\Models\Product;
use Illuminate\Support\Facades\DB;

// Fetch all products
$products = Product::all();

echo "Starting gallery seeder for " . $products->count() . " products...\n";

// Clear existing gallery images just in case
DB::table('productimgs')->truncate();

$dummyImages = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1572635196237-14b3f281501f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800'
];

$count = 0;

foreach ($products as $product) {
    // We will attach 3 random gallery images to each product
    $keys = array_rand($dummyImages, 3);
    
    $product->productimg()->create([
        'img_path' => $dummyImages[$keys[0]],
        'sort_order' => 1
    ]);
    
    $product->productimg()->create([
        'img_path' => $dummyImages[$keys[1]],
        'sort_order' => 2
    ]);

    $product->productimg()->create([
        'img_path' => $dummyImages[$keys[2]],
        'sort_order' => 3
    ]);
    
    $count++;
}

echo "Successfully populated gallery images for {$count} products!\n";
