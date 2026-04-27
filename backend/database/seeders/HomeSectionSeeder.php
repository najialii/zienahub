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
                'title_en' => 'Exquisite Floral Collections',
                'title_ar' => 'مجموعات الزهور الرائعة',
                'description_en' => 'Experience the art of gifting with our premium curated sliders.',
                'description_ar' => 'اختبر فن الإهداء مع شرائحنا المنسقة المتميزة.',
                'settings' => [
                    'autoplay' => true,
                    'autoplay_delay' => 5000,
                    'transition' => 'fade',
                    'show_dots' => true,
                    'show_arrows' => true,
                    'full_width' => true,
                    'height' => '80vh'
                ],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'category_scroll',
                'type' => 'custom',
                'title_en' => 'Browse by Category',
                'title_ar' => 'تصفح حسب الفئة',
                'description_en' => 'Quick access to our main botanical departments.',
                'description_ar' => 'وصول سريع إلى أقسامنا النباتية الرئيسية.',
                'settings' => [
                    'show_all_categories' => true,
                    'max_categories' => 12,
                    'image_shape' => 'circle', // Making it look like NiceOne/Instagram stories
                    'show_labels' => true
                ],
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'promotional_top',
                'type' => 'banner',
                'title_en' => 'Today\'s Special Offers',
                'title_ar' => 'عروض خاصة اليوم',
                'description_en' => 'Limited time deals on our most popular arrangements.',
                'description_ar' => 'عروض لفترة محدودة على أشهر تنسيقاتنا.',
                'settings' => [
                    'banner_type' => 'promotional',
                    'position' => 'top',
                    'layout' => 'grid',
                    'columns' => 2,
                    'gap' => '20px',
                    'max_banners' => 4
                ],
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'product_row_1',
                'type' => 'product_row',
                'title_en' => 'Signature Roses',
                'title_ar' => 'ورودنا الخاصة',
                'description_en' => 'Hand-picked premium roses for your special moments.',
                'description_ar' => 'ورود فاخرة منتقاة يدوياً للحظاتك الخاصة.',
                'settings' => [
                    'category_filter' => 'roses',
                    'product_count' => 8,
                    'enable_slider' => true, // Scrollable row
                    'show_price' => true,
                    'show_rating' => true,
                    'show_add_to_cart' => true
                ],
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'flash_sale_timer',
                'type' => 'countdown',
                'title_en' => 'Flash Sale Ending Soon',
                'title_ar' => 'تنتهي عروض الفلاش قريباً',
                'description_en' => 'Grab your favorites before they are gone!',
                'description_ar' => 'احصل على مفضلاتك قبل نفاذ الكمية!',
                'settings' => [
                    'end_date' => '2026-12-31 23:59:59',
                    'background_color' => '#f8f4f1',
                    'text_color' => '#b38b5d'
                ],
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'featured_subcategories',
                'type' => 'featured_subcategories',
                'title_en' => 'Luxury Collections',
                'title_ar' => 'مجموعات فاخرة',
                'description_en' => 'Curated subcategories featuring high-end gift sets.',
                'description_ar' => 'أقسام فرعية منسقة تضم مجموعات هدايا راقية.',
                'settings' => [
                    'products_per_subcategory' => 4,
                    'max_subcategories' => 3,
                    'view_more_link' => true
                ],
                'sort_order' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'middle_cta',
                'type' => 'banner',
                'title_en' => 'Custom Bouquet Builder',
                'title_ar' => 'صمم باقتك الخاصة',
                'description_en' => 'Can’t find what you need? Design your own arrangement.',
                'description_ar' => 'لم تجد ما تحتاجه؟ صمم تنسيقك الخاص.',
                'settings' => [
                    'banner_type' => 'full_width_cta',
                    'image_url' => 'cta-bg.jpg',
                    'button_text_en' => 'Start Designing',
                    'button_text_ar' => 'ابدأ التصميم',
                    'overlay_opacity' => 0.4
                ],
                'sort_order' => 7,
                'is_active' => true,
            ],
            [
                'name' => 'testimonials',
                'type' => 'testimonials',
                'title_en' => 'What Our Customers Say',
                'title_ar' => 'ماذا يقول عملاؤنا',
                'description_en' => 'Join thousands of happy customers.',
                'description_ar' => 'انضم إلى آلاف العملاء السعداء.',
                'settings' => [
                    'max_items' => 5,
                    'autoplay' => true,
                    'style' => 'minimal'
                ],
                'sort_order' => 8,
                'is_active' => true,
            ],
            [
                'name' => 'newsletter',
                'type' => 'newsletter',
                'title_en' => 'Unlock 10% Off Your First Order',
                'title_ar' => 'احصل على خصم 10% على طلبك الأول',
                'description_en' => 'Subscribe to our newsletter for exclusive updates and floral tips.',
                'description_ar' => 'اشترك في نشرتنا الإخبارية للحصول على تحديثات حصرية ونصائح حول الزهور.',
                'settings' => [
                    'placeholder_en' => 'Enter your email',
                    'placeholder_ar' => 'أدخل بريدك الإلكتروني',
                    'button_color' => '#000000'
                ],
                'sort_order' => 9,
                'is_active' => true,
            ],
        ];

        foreach ($sections as $section) {
            // Using updateOrCreate ensures you don't create 1000 rows if you run the seeder twice
            HomeSection::updateOrCreate(
                ['name' => $section['name']],
                $section
            );
        }
    }
}