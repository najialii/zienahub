<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Support\Facades\DB;

// Product to tag mappings
$productTagMappings = [
    // Roses products
    'red-roses-bouquet' => ['mothers-day', 'valentines-day', 'mother', 'wife', 'romantic', 'elegant'],
    'white-roses-arrangement' => ['mothers-day', 'valentines-day', 'mother', 'wife', 'romantic', 'elegant'],
    'pink-roses-basket' => ['mothers-day', 'valentines-day', 'mother', 'wife', 'romantic', 'elegant'],
    
    // Tulips
    'mixed-tulips-bouquet' => ['mothers-day', 'valentines-day', 'mother', 'wife', 'romantic', 'elegant'],
    
    // Orchids
    'purple-orchid-plant' => ['mothers-day', 'mother', 'wife', 'elegant', 'luxury'],
    
    // Birthday gifts
    'birthday-celebration-box' => ['birthday', 'mother', 'father', 'wife', 'husband', 'sister', 'brother', 'friend'],
    
    // Wedding gifts
    'luxury-wedding-hamper' => ['wedding', 'wife', 'husband', 'luxury', 'elegant'],
    
    // Corporate gifts
    'executive-gift-set' => ['graduation', 'adults', 'modern', 'classic'],
    
    // Chocolates
    'belgian-dark-chocolate-box' => ['birthday', 'valentines-day', 'mother', 'wife', 'girlfriend', 'luxury'],
    'swiss-milk-chocolate-collection' => ['birthday', 'valentines-day', 'mother', 'wife', 'girlfriend', 'luxury'],
    
    // Perfumes
    'oud-wood-perfume' => ['fathers-day', 'father', 'husband', 'boyfriend', 'brother', 'adults', 'luxury'],
    'rose-garden-perfume' => ['mothers-day', 'mother', 'wife', 'girlfriend', 'sister', 'adults', 'luxury'],
    
    // Jewelry
    'silver-necklace-set' => ['mothers-day', 'valentines-day', 'anniversary', 'wedding', 'mother', 'wife', 'girlfriend', 'sister', 'luxury', 'elegant'],
    
    // Home decor
    'ceramic-vase-set' => ['wedding', 'anniversary', 'adults', 'modern', 'elegant'],
];

echo "Assigning tags to products...\n";

foreach ($productTagMappings as $productSlug => $tagSlugs) {
    // Get product ID
    $productId = DB::table('products')->where('slug', $productSlug)->value('id');
    
    if (!$productId) {
        echo "Product not found: $productSlug\n";
        continue;
    }
    
    echo "Processing product: $productSlug (ID: $productId)\n";
    
    foreach ($tagSlugs as $tagSlug) {
        // Get tag ID
        $tagId = DB::table('tags')->where('slug', $tagSlug)->value('id');
        
        if (!$tagId) {
            echo "  Tag not found: $tagSlug\n";
            continue;
        }
        
        // Check if relationship already exists
        $exists = DB::table('product_tag')
            ->where('product_id', $productId)
            ->where('tag_id', $tagId)
            ->exists();
            
        if (!$exists) {
            DB::table('product_tag')->insert([
                'product_id' => $productId,
                'tag_id' => $tagId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            echo "  Assigned tag: $tagSlug\n";
        } else {
            echo "  Tag already assigned: $tagSlug\n";
        }
    }
}

echo "Done!\n";