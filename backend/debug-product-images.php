<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Debugging Product Images in Featured Subcategories\n";
echo "=================================================\n\n";

try {
    // Test the API endpoint and check image URLs
    $featuredSubcategories = App\Models\Subcategory::with(['category.translations', 'translations', 'products'])
        ->featured()
        ->orderedByFeatured()
        ->get()
        ->map(function($subcategory) {
            // Get featured products for this subcategory
            $products = $subcategory->getFeaturedProducts(4)->map(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'image_url' => $product->image_url,
                    'status' => $product->status,
                ];
            });

            return [
                'id' => $subcategory->id,
                'name' => $subcategory->getName('en'),
                'products' => $products,
            ];
        });

    echo "Featured subcategories with product image details:\n\n";

    foreach ($featuredSubcategories as $subcategory) {
        echo "📁 {$subcategory['name']} (ID: {$subcategory['id']})\n";
        
        foreach ($subcategory['products'] as $product) {
            echo "   📦 {$product['name']}\n";
            echo "      - ID: {$product['id']}\n";
            echo "      - Price: \${$product['price']}\n";
            echo "      - Image URL: " . ($product['image_url'] ?: 'NULL/EMPTY') . "\n";
            echo "      - Status: {$product['status']}\n";
            
            // Check if image file exists (if it's a local path)
            if ($product['image_url']) {
                if (str_starts_with($product['image_url'], '/storage/') || str_starts_with($product['image_url'], 'storage/')) {
                    $imagePath = public_path($product['image_url']);
                    echo "      - File exists: " . (file_exists($imagePath) ? 'YES' : 'NO') . "\n";
                    echo "      - Full path: $imagePath\n";
                } else {
                    echo "      - External URL or absolute path\n";
                }
            }
            echo "\n";
        }
        echo "\n";
    }

    // Check products table structure
    echo "Products table image_url column info:\n";
    $columns = DB::select("DESCRIBE products");
    foreach ($columns as $column) {
        if ($column->Field === 'image_url') {
            echo "- Field: {$column->Field}\n";
            echo "- Type: {$column->Type}\n";
            echo "- Null: {$column->Null}\n";
            echo "- Default: " . ($column->Default ?? 'NULL') . "\n";
            break;
        }
    }

    // Check some sample products directly from database
    echo "\nSample products from database:\n";
    $sampleProducts = DB::table('products')
        ->select('id', 'name', 'image_url', 'status')
        ->limit(5)
        ->get();

    foreach ($sampleProducts as $product) {
        echo "- {$product->name}: " . ($product->image_url ?: 'NO IMAGE') . "\n";
    }

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}