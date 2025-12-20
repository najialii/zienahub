<?php

// Product to tag mappings
$mappings = [
    'red-roses-bouquet' => ['mothers-day', 'valentines-day', 'mother', 'wife'],
    'white-roses-arrangement' => ['mothers-day', 'valentines-day', 'mother', 'wife'],
    'pink-roses-basket' => ['mothers-day', 'valentines-day', 'mother', 'wife'],
    'mixed-tulips-bouquet' => ['mothers-day', 'valentines-day', 'mother', 'wife'],
    'purple-orchid-plant' => ['mothers-day', 'mother', 'wife'],
    'birthday-celebration-box' => ['birthday', 'mother', 'father', 'wife', 'husband'],
    'luxury-wedding-hamper' => ['wedding', 'wife', 'husband'],
    'executive-gift-set' => ['graduation', 'father', 'husband'],
    'belgian-dark-chocolate-box' => ['birthday', 'valentines-day', 'mother', 'wife'],
    'swiss-milk-chocolate-collection' => ['birthday', 'valentines-day', 'mother', 'wife'],
    'oud-wood-perfume' => ['fathers-day', 'father', 'husband'],
    'rose-garden-perfume' => ['mothers-day', 'mother', 'wife'],
    'silver-necklace-set' => ['mothers-day', 'valentines-day', 'mother', 'wife'],
    'ceramic-vase-set' => ['wedding', 'mother', 'wife'],
];

foreach ($mappings as $productSlug => $tagSlugs) {
    $product = App\Models\Product::where('slug', $productSlug)->first();
    if ($product) {
        foreach ($tagSlugs as $tagSlug) {
            $tag = App\Models\Tag::where('slug', $tagSlug)->first();
            if ($tag) {
                $product->tags()->syncWithoutDetaching([$tag->id]);
                echo "Assigned tag {$tagSlug} to product {$productSlug}\n";
            }
        }
    }
}

echo "Done!\n";