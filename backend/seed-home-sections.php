<?php

use App\Models\HomeSection;
use Illuminate\Support\Facades\DB;

// Clear existing items
DB::table('home_sections')->truncate();

$sections = [
    [
        'name' => 'main_hero_banner',
        'type' => 'banner',
        'title_en' => 'Main Promotional Banner',
        'title_ar' => 'البانر الترويجي الرئيسي',
        'description_en' => null,
        'description_ar' => null,
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
        'name' => 'main_category_scroll',
        'type' => 'category_scroll',
        'title_en' => 'Shop by Category',
        'title_ar' => 'تسوق حسب الفئة',
        'description_en' => null,
        'description_ar' => null,
        'settings' => [],
        'sort_order' => 2,
        'is_active' => true,
    ],
    [
        'name' => 'main_partners',
        'type' => 'tenant_carousel',
        'title_en' => 'Our Partners',
        'title_ar' => 'شركاؤنا',
        'description_en' => null,
        'description_ar' => null,
        'settings' => [],
        'sort_order' => 3,
        'is_active' => true,
    ],
    [
        'name' => 'main_featured_subcategories',
        'type' => 'featured_subcategories',
        'title_en' => 'Featured Categories',
        'title_ar' => 'فئات مميزة',
        'description_en' => null,
        'description_ar' => null,
        'settings' => [],
        'sort_order' => 4,
        'is_active' => true,
    ],
];

foreach ($sections as $sectionData) {
    HomeSection::create($sectionData);
}

echo "Successfully seeded " . count($sections) . " home sections.\n";
