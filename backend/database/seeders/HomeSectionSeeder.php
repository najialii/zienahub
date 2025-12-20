<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\HomeSection;

class HomeSectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sections = [
            [
                'name' => 'hero_slider',
                'type' => 'hero_slider',
                'title_en' => 'Hero Slider',
                'title_ar' => 'شريط البطل',
                'description_en' => 'Main hero slider at the top of the homepage',
                'description_ar' => 'شريط البطل الرئيسي في أعلى الصفحة الرئيسية',
                'settings' => [
                    'autoplay' => true,
                    'autoplay_delay' => 5000,
                    'show_dots' => true,
                    'show_arrows' => true,
                    'height' => 'auto'
                ],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'category_scroll',
                'type' => 'custom',
                'title_en' => 'Category Scroll',
                'title_ar' => 'تمرير الفئات',
                'description_en' => 'Horizontal scrolling category navigation',
                'description_ar' => 'تنقل الفئات بالتمرير الأفقي',
                'settings' => [
                    'show_all_categories' => true,
                    'max_categories' => 10
                ],
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'promotional_top',
                'type' => 'banner',
                'title_en' => 'Top Promotional Banners',
                'title_ar' => 'بانرات ترويجية علوية',
                'description_en' => 'Promotional banners displayed at the top of content',
                'description_ar' => 'بانرات ترويجية معروضة في أعلى المحتوى',
                'settings' => [
                    'banner_type' => 'promotional',
                    'position' => 'top',
                    'layout' => 'grid',
                    'columns' => 2,
                    'max_banners' => 4
                ],
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'product_row_1',
                'type' => 'product_row',
                'title_en' => 'Premium Roses',
                'title_ar' => 'ورود مميزة',
                'description_en' => 'Featured roses and bouquets collection',
                'description_ar' => 'مجموعة الورود والباقات المميزة',
                'settings' => [
                    'category_filter' => 'flowers',
                    'product_count' => 4,
                    'show_price' => true,
                    'show_add_to_cart' => true,
                    'layout' => 'grid'
                ],
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'featured_tags',
                'type' => 'featured_tags',
                'title_en' => 'Featured Tags',
                'title_ar' => 'العلامات المميزة',
                'description_en' => 'Display featured product tags',
                'description_ar' => 'عرض علامات المنتجات المميزة',
                'settings' => [
                    'max_tags' => 8,
                    'layout' => 'grid',
                    'columns' => 4
                ],
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'featured_subcategories',
                'type' => 'featured_subcategories',
                'title_en' => 'Featured Collections',
                'title_ar' => 'المجموعات المميزة',
                'description_en' => 'Display featured subcategories with their top products',
                'description_ar' => 'عرض الأقسام الفرعية المميزة مع أفضل منتجاتها',
                'settings' => [
                    'products_per_subcategory' => 4,
                    'max_subcategories' => 3
                ],
                'sort_order' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'category_banners',
                'type' => 'banner',
                'title_en' => 'Category Banners',
                'title_ar' => 'بانرات الفئات',
                'description_en' => 'Category-specific promotional banners',
                'description_ar' => 'بانرات ترويجية خاصة بالفئات',
                'settings' => [
                    'banner_type' => 'category_banner',
                    'layout' => 'grid',
                    'columns' => 2,
                    'max_banners' => 2
                ],
                'sort_order' => 7,
                'is_active' => true,
            ],
            [
                'name' => 'product_row_2',
                'type' => 'product_row',
                'title_en' => 'Luxury Gift Sets',
                'title_ar' => 'طقم هدايا فاخرة',
                'description_en' => 'Premium gift boxes and luxury items',
                'description_ar' => 'صناديق هدايا مميزة وعناصر فاخرة',
                'settings' => [
                    'category_filter' => 'luxury-gifts',
                    'product_count' => 4,
                    'show_price' => true,
                    'show_add_to_cart' => true,
                    'layout' => 'grid'
                ],
                'sort_order' => 8,
                'is_active' => true,
            ],
            [
                'name' => 'promotional_middle',
                'type' => 'banner',
                'title_en' => 'Middle Promotional Banners',
                'title_ar' => 'بانرات ترويجية وسطية',
                'description_en' => 'Promotional banners in the middle of content',
                'description_ar' => 'بانرات ترويجية في وسط المحتوى',
                'settings' => [
                    'banner_type' => 'promotional',
                    'position' => 'middle',
                    'layout' => 'single',
                    'max_banners' => 1
                ],
                'sort_order' => 9,
                'is_active' => true,
            ],
            [
                'name' => 'product_row_3',
                'type' => 'product_row',
                'title_en' => 'Featured Products',
                'title_ar' => 'منتجات مميزة',
                'description_en' => 'Highlighted and trending products',
                'description_ar' => 'منتجات مميزة ورائجة',
                'settings' => [
                    'category_filter' => 'featured',
                    'product_count' => 4,
                    'show_price' => true,
                    'show_add_to_cart' => true,
                    'layout' => 'grid'
                ],
                'sort_order' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($sections as $section) {
            HomeSection::create($section);
        }
    }
}