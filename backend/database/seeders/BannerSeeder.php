<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Banner;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banners = [
            [
                'title_en' => 'Premium Roses Collection',
                'title_ar' => 'مجموعة الورود المميزة',
                'description_en' => 'Discover our exclusive collection of premium roses for every special occasion',
                'description_ar' => 'اكتشف مجموعتنا الحصرية من الورود المميزة لكل مناسبة خاصة',
                'image_url' => '/images/banners/hero-roses.jpg',
                'mobile_image_url' => '/images/banners/hero-roses-mobile.jpg',
                'link_url' => '/products?category=flowers',
                'link_text_en' => 'Shop Now',
                'link_text_ar' => 'تسوق الآن',
                'type' => 'hero_slider',
                'position' => 'center',
                'sort_order' => 1,
                'is_active' => true,
                'background_color' => '#f8f9fa',
                'text_color' => '#212529',
                'text_alignment' => 'center',
            ],
            [
                'title_en' => 'Luxury Gift Boxes',
                'title_ar' => 'صناديق الهدايا الفاخرة',
                'description_en' => 'Curated gift boxes perfect for birthdays, anniversaries, and special celebrations',
                'description_ar' => 'صناديق هدايا مختارة بعناية مثالية لأعياد الميلاد والذكريات والاحتفالات الخاصة',
                'image_url' => '/images/banners/hero-gifts.jpg',
                'mobile_image_url' => '/images/banners/hero-gifts-mobile.jpg',
                'link_url' => '/products?category=gift-boxes',
                'link_text_en' => 'Explore Gifts',
                'link_text_ar' => 'استكشف الهدايا',
                'type' => 'hero_slider',
                'position' => 'center',
                'sort_order' => 2,
                'is_active' => true,
                'background_color' => '#fff5f5',
                'text_color' => '#991b1b',
                'text_alignment' => 'center',
            ],
            [
                'title_en' => 'Valentine\'s Day Special',
                'title_ar' => 'عرض خاص بعيد الحب',
                'description_en' => 'Express your love with our romantic collection - Up to 30% off',
                'description_ar' => 'عبر عن حبك مع مجموعتنا الرومانسية - خصم يصل إلى 30%',
                'image_url' => '/images/banners/valentine-banner.jpg',
                'mobile_image_url' => '/images/banners/valentine-banner-mobile.jpg',
                'link_url' => '/products?tag=valentine',
                'link_text_en' => 'Shop Valentine\'s',
                'link_text_ar' => 'تسوق عيد الحب',
                'type' => 'promotional',
                'position' => 'top',
                'sort_order' => 1,
                'is_active' => true,
                'background_color' => '#fecaca',
                'text_color' => '#7f1d1d',
                'text_alignment' => 'center',
            ],
            [
                'title_en' => 'Mother\'s Day Collection',
                'title_ar' => 'مجموعة عيد الأم',
                'description_en' => 'Show your appreciation with our beautiful Mother\'s Day gifts',
                'description_ar' => 'أظهر تقديرك مع هدايا عيد الأم الجميلة',
                'image_url' => '/images/banners/mothers-day-sidebar.jpg',
                'link_url' => '/products?tag=mother',
                'link_text_en' => 'For Mom',
                'link_text_ar' => 'للأم',
                'type' => 'sidebar_banner',
                'position' => 'right',
                'sort_order' => 1,
                'is_active' => true,
                'background_color' => '#f3e8ff',
                'text_color' => '#581c87',
                'text_alignment' => 'center',
            ],
            [
                'title_en' => 'Birthday Celebrations',
                'title_ar' => 'احتفالات أعياد الميلاد',
                'description_en' => 'Make every birthday memorable with our special collection',
                'description_ar' => 'اجعل كل عيد ميلاد لا يُنسى مع مجموعتنا الخاصة',
                'image_url' => '/images/banners/birthday-category.jpg',
                'link_url' => '/products?tag=birthday',
                'link_text_en' => 'Birthday Gifts',
                'link_text_ar' => 'هدايا أعياد الميلاد',
                'type' => 'category_banner',
                'position' => 'center',
                'sort_order' => 1,
                'is_active' => true,
                'background_color' => '#fef3c7',
                'text_color' => '#92400e',
                'text_alignment' => 'center',
            ],
        ];

        foreach ($banners as $banner) {
            Banner::create($banner);
        }
    }
}