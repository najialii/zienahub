<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Banner;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing banners to avoid duplicates
        Banner::truncate();

        $banners = [
            // === PROMOTIONAL BANNERS (Hero Slider - position: top) ===
            [
                'title_en' => 'Glow Up This Season',
                'title_ar' => 'تألقي هذا الموسم',
                'description_en' => 'Premium skincare serums now up to 40% off. Your skin deserves the best.',
                'description_ar' => 'سيرومات العناية بالبشرة الفاخرة الآن بخصم يصل إلى 40%. بشرتك تستحق الأفضل.',
                'image_url' => 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&h=500&fit=crop',
                'mobile_image_url' => 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
                'link_url' => '/en/products/vitamin-c-serum',
                'link_text_en' => 'Shop Now',
                'link_text_ar' => 'تسوق الآن',
                'type' => 'promotional',
                'position' => 'top',
                'sort_order' => 1,
                'is_active' => true,
                'background_color' => '#1a1a2e',
                'text_color' => '#ffffff',
                'text_alignment' => 'left',
            ],
            [
                'title_en' => 'Luxury Fragrances',
                'title_ar' => 'عطور فاخرة',
                'description_en' => 'Discover designer perfumes & premium Oud oils from the finest houses.',
                'description_ar' => 'اكتشف عطور المصممين وزيوت العود الفاخرة من أرقى الدور.',
                'image_url' => 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1400&h=500&fit=crop',
                'mobile_image_url' => 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop',
                'link_url' => '/en/products/designer-perfume-50ml',
                'link_text_en' => 'Explore Collection',
                'link_text_ar' => 'استكشف المجموعة',
                'type' => 'promotional',
                'position' => 'top',
                'sort_order' => 2,
                'is_active' => true,
                'background_color' => '#0f0f23',
                'text_color' => '#ffffff',
                'text_alignment' => 'center',
            ],
            [
                'title_en' => 'Free Shipping on Orders Over 200 SAR',
                'title_ar' => 'شحن مجاني للطلبات فوق 200 ريال',
                'description_en' => 'Shop beauty, perfumes, and gifts — delivered straight to your door.',
                'description_ar' => 'تسوق مستحضرات التجميل والعطور والهدايا — إلى باب بيتك.',
                'image_url' => 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1400&h=500&fit=crop',
                'mobile_image_url' => 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&h=600&fit=crop',
                'link_url' => '/en/products',
                'link_text_en' => 'Start Shopping',
                'link_text_ar' => 'ابدأ التسوق',
                'type' => 'promotional',
                'position' => 'top',
                'sort_order' => 3,
                'is_active' => true,
                'background_color' => '#16213e',
                'text_color' => '#ffffff',
                'text_alignment' => 'center',
            ],

            // === CATEGORY BANNERS (Promo Grid - position: middle) ===
            [
                'title_en' => 'Skincare Essentials',
                'title_ar' => 'أساسيات العناية بالبشرة',
                'description_en' => 'Cleansers, serums & moisturizers',
                'description_ar' => 'منظفات وسيرومات ومرطبات',
                'image_url' => 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=700&h=400&fit=crop',
                'link_url' => '/en/products/gentle-face-wash',
                'link_text_en' => 'Shop Skincare',
                'link_text_ar' => 'تسوق العناية بالبشرة',
                'type' => 'category_banner',
                'position' => 'middle',
                'sort_order' => 1,
                'is_active' => true,
                'background_color' => '#fef3c7',
                'text_color' => '#92400e',
                'text_alignment' => 'left',
            ],
            [
                'title_en' => 'Premium Oud Collection',
                'title_ar' => 'مجموعة العود الفاخرة',
                'description_en' => 'Authentic Arabian fragrances',
                'description_ar' => 'عطور عربية أصيلة',
                'image_url' => 'https://images.unsplash.com/photo-1594035910387-fea081e83808?w=700&h=400&fit=crop',
                'link_url' => '/en/products/oud-perfume-oil',
                'link_text_en' => 'Discover Oud',
                'link_text_ar' => 'اكتشف العود',
                'type' => 'category_banner',
                'position' => 'middle',
                'sort_order' => 2,
                'is_active' => true,
                'background_color' => '#f3e8ff',
                'text_color' => '#581c87',
                'text_alignment' => 'left',
            ],
        ];

        foreach ($banners as $banner) {
            Banner::create($banner);
        }

        $this->command->info('Created ' . count($banners) . ' marketing banners.');
    }
}