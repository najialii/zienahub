<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenants = [
            [
                'name' => 'Flower Paradise',
                'slug' => 'flower-paradise',
                'description' => 'Premium flowers and floral arrangements for all occasions',
                'logo' => '/images/tenants/flower-paradise-logo.jpg',
                'cover_image' => '/images/tenants/flower-paradise-cover.jpg',
                'featured' => true,
            ],
            [
                'name' => 'Gift Galaxy',
                'slug' => 'gift-galaxy',
                'description' => 'Unique gifts and personalized presents for your loved ones',
                'logo' => '/images/tenants/gift-galaxy-logo.jpg',
                'cover_image' => '/images/tenants/gift-galaxy-cover.jpg',
                'featured' => true,
            ],
            [
                'name' => 'Luxury Chocolates',
                'slug' => 'luxury-chocolates',
                'description' => 'Artisan chocolates and confections from around the world',
                'logo' => '/images/tenants/luxury-chocolates-logo.jpg',
                'cover_image' => '/images/tenants/luxury-chocolates-cover.jpg',
                'featured' => true,
            ],
            [
                'name' => 'Perfume Palace',
                'slug' => 'perfume-palace',
                'description' => 'Designer fragrances and luxury perfumes',
                'logo' => '/images/tenants/perfume-palace-logo.jpg',
                'cover_image' => '/images/tenants/perfume-palace-cover.jpg',
                'featured' => true,
            ],
            [
                'name' => 'Beauty Box',
                'slug' => 'beauty-box',
                'description' => 'Premium skincare and cosmetics',
                'logo' => '/images/tenants/beauty-box-logo.jpg',
                'cover_image' => '/images/tenants/beauty-box-cover.jpg',
                'featured' => true,
            ],
            [
                'name' => 'Cake Studio',
                'slug' => 'cake-studio',
                'description' => 'Custom cakes and baked goods for special occasions',
                'logo' => '/images/tenants/cake-studio-logo.jpg',
                'cover_image' => '/images/tenants/cake-studio-cover.jpg',
                'featured' => true,
            ],
            [
                'name' => 'Balloon World',
                'slug' => 'balloon-world',
                'description' => 'Creative balloon decorations and arrangements',
                'logo' => '/images/tenants/balloon-world-logo.jpg',
                'cover_image' => '/images/tenants/balloon-world-cover.jpg',
                'featured' => true,
            ],
            [
                'name' => 'Candle Craft',
                'slug' => 'candle-craft',
                'description' => 'Handcrafted candles and home fragrances',
                'logo' => '/images/tenants/candle-craft-logo.jpg',
                'cover_image' => '/images/tenants/candle-craft-cover.jpg',
                'featured' => true,
            ],
        ];

        foreach ($tenants as $tenantData) {
            DB::table('tenants')->insert([
                'name' => $tenantData['name'],
                'slug' => $tenantData['slug'],
                'description' => $tenantData['description'],
                'logo' => $tenantData['logo'],
                'cover_image' => $tenantData['cover_image'],
                'featured' => $tenantData['featured'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}