<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\Tag;
use Illuminate\Console\Command;

class AssignTagsToProducts extends Command
{
    protected $signature = 'products:assign-tags';
    protected $description = 'Assign tags to existing products';

    public function handle()
    {
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

        $this->info('Assigning tags to products...');

        foreach ($mappings as $productSlug => $tagSlugs) {
            $product = Product::where('slug', $productSlug)->first();
            
            if (!$product) {
                $this->warn("Product not found: {$productSlug}");
                continue;
            }

            $this->info("Processing product: {$productSlug}");
            
            $tagIds = [];
            foreach ($tagSlugs as $tagSlug) {
                $tag = Tag::where('slug', $tagSlug)->first();
                if ($tag) {
                    $tagIds[] = $tag->id;
                    $this->line("  - Found tag: {$tagSlug}");
                } else {
                    $this->warn("  - Tag not found: {$tagSlug}");
                }
            }
            
            if (!empty($tagIds)) {
                $product->tags()->syncWithoutDetaching($tagIds);
                $this->info("  Assigned " . count($tagIds) . " tags to {$productSlug}");
            }
        }

        $this->info('Done!');
        return 0;
    }
}