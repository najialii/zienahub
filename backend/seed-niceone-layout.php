<?php

use App\Models\HomeSection;
use Illuminate\Support\Facades\DB;

// Clear existing items
DB::table('home_sections')->truncate();

$sections = [
    [
        'name' => 'main_hero_banner',
        'type' => 'banner',
        'title_en' => 'Welcome Banners',
        'title_ar' => 'لافتات الترحيب',
        'settings' => [
            'banner_type' => 'promotional',
            'position' => 'top',
            'height' => 'lg',
            'layout' => 'slider'
        ],
        'sort_order' => 1,
        'is_active' => true,
    ],
    [
        'name' => 'category_icons',
        'type' => 'category_scroll',
        'title_en' => 'Shop by Category',
        'title_ar' => 'تسوق حسب الفئة',
        'settings' => [],
        'sort_order' => 2,
        'is_active' => true,
    ],
    [
        'name' => 'promo_banners',
        'type' => 'banner',
        'title_en' => 'Special Offers',
        'title_ar' => 'عروض خاصة',
        'settings' => [
            'banner_type' => 'category_banner',
            'position' => 'middle',
            'layout' => 'grid',
            'columns' => 2
        ],
        'sort_order' => 3,
        'is_active' => true,
    ],
    [
        'name' => 'flash_sales',
        'type' => 'product_row',
        'title_en' => 'Flash Sales',
        'title_ar' => 'عروض مذهلة',
        'settings' => [
            'product_count' => 12,
            'category_filter' => 'featured',
            'background_color' => 'bg-pink-50' // Light pink background like NiceOne's deal wrapper!
        ],
        'sort_order' => 4,
        'is_active' => true,
    ],
    [
        'name' => 'top_brands',
        'type' => 'tenant_carousel',
        'title_en' => 'Top Brands',
        'title_ar' => 'أفضل العلامات التجارية',
        'settings' => [],
        'sort_order' => 5,
        'is_active' => true,
    ],
    [
        'name' => 'bestsellers',
        'type' => 'product_row',
        'title_en' => 'Make Up',
        'title_ar' => 'مكياج',
        'settings' => [
            'product_count' => 12,
            'background_color' => 'bg-white'
        ],
        'sort_order' => 6,
        'is_active' => true,
    ],
];

foreach ($sections as $sectionData) {
    HomeSection::create($sectionData);
}

echo "Successfully seeded " . count($sections) . " structured NiceOne layout sections.\n";
