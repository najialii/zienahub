<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            // Occasions
            [
                'name_en' => 'Mother\'s Day',
                'name_ar' => 'عيد الأم',
                'slug' => 'mothers-day',
                'type' => 'occasion',
                'color' => '#FF69B4',
                'icon' => 'Flower2',
                'sort_order' => 1,
                'is_featured' => true,
            ],
            [
                'name_en' => 'Father\'s Day',
                'name_ar' => 'عيد الأب',
                'slug' => 'fathers-day',
                'type' => 'occasion',
                'color' => '#4169E1',
                'icon' => 'Shirt',
                'sort_order' => 2,
                'is_featured' => true,
            ],
            [
                'name_en' => 'Valentine\'s Day',
                'name_ar' => 'عيد الحب',
                'slug' => 'valentines-day',
                'type' => 'occasion',
                'color' => '#DC143C',
                'icon' => 'Heart',
                'sort_order' => 3,
                'is_featured' => true,
            ],
            [
                'name_en' => 'Birthday',
                'name_ar' => 'عيد ميلاد',
                'slug' => 'birthday',
                'type' => 'occasion',
                'color' => '#FFD700',
                'icon' => 'Cake',
                'sort_order' => 4,
                'is_featured' => true,
            ],
            [
                'name_en' => 'Anniversary',
                'name_ar' => 'ذكرى سنوية',
                'slug' => 'anniversary',
                'type' => 'occasion',
                'color' => '#9370DB',
                'icon' => 'Gem',
                'sort_order' => 5,
            ],
            [
                'name_en' => 'Graduation',
                'name_ar' => 'التخرج',
                'slug' => 'graduation',
                'type' => 'occasion',
                'color' => '#228B22',
                'icon' => 'GraduationCap',
                'sort_order' => 6,
            ],
            [
                'name_en' => 'Wedding',
                'name_ar' => 'زفاف',
                'slug' => 'wedding',
                'type' => 'occasion',
                'color' => '#F8F8FF',
                'icon' => 'Church',
                'sort_order' => 7,
            ],

            // Giftees
            [
                'name_en' => 'Mother',
                'name_ar' => 'أم',
                'slug' => 'mother',
                'type' => 'giftee',
                'color' => '#FF1493',
                'icon' => 'UserRound',
                'sort_order' => 10,
                'is_featured' => true,
            ],
            [
                'name_en' => 'Father',
                'name_ar' => 'أب',
                'slug' => 'father',
                'type' => 'giftee',
                'color' => '#4682B4',
                'icon' => 'User',
                'sort_order' => 11,
                'is_featured' => true,
            ],
            [
                'name_en' => 'Wife',
                'name_ar' => 'زوجة',
                'slug' => 'wife',
                'type' => 'giftee',
                'color' => '#FF69B4',
                'icon' => 'Crown',
                'sort_order' => 12,
                'is_featured' => true,
            ],
            [
                'name_en' => 'Husband',
                'name_ar' => 'زوج',
                'slug' => 'husband',
                'type' => 'giftee',
                'color' => '#2F4F4F',
                'icon' => 'UserCheck',
                'sort_order' => 13,
                'is_featured' => true,
            ],
            [
                'name_en' => 'Girlfriend',
                'name_ar' => 'صديقة',
                'slug' => 'girlfriend',
                'type' => 'giftee',
                'color' => '#FF6347',
                'icon' => 'UserHeart',
                'sort_order' => 14,
            ],
            [
                'name_en' => 'Boyfriend',
                'name_ar' => 'صديق',
                'slug' => 'boyfriend',
                'type' => 'giftee',
                'color' => '#4169E1',
                'icon' => 'UserPlus',
                'sort_order' => 15,
            ],
            [
                'name_en' => 'Sister',
                'name_ar' => 'أخت',
                'slug' => 'sister',
                'type' => 'giftee',
                'color' => '#DA70D6',
                'icon' => 'Users',
                'sort_order' => 16,
            ],
            [
                'name_en' => 'Brother',
                'name_ar' => 'أخ',
                'slug' => 'brother',
                'type' => 'giftee',
                'color' => '#32CD32',
                'icon' => 'Users2',
                'sort_order' => 17,
            ],
            [
                'name_en' => 'Friend',
                'name_ar' => 'صديق',
                'slug' => 'friend',
                'type' => 'giftee',
                'color' => '#FFA500',
                'icon' => 'UserRoundPlus',
                'sort_order' => 18,
            ],

            // Age Groups
            [
                'name_en' => 'Kids',
                'name_ar' => 'أطفال',
                'slug' => 'kids',
                'type' => 'age_group',
                'color' => '#FF4500',
                'icon' => 'Baby',
                'sort_order' => 20,
            ],
            [
                'name_en' => 'Teens',
                'name_ar' => 'مراهقون',
                'slug' => 'teens',
                'type' => 'age_group',
                'color' => '#9932CC',
                'icon' => 'UserRound',
                'sort_order' => 21,
            ],
            [
                'name_en' => 'Adults',
                'name_ar' => 'بالغون',
                'slug' => 'adults',
                'type' => 'age_group',
                'color' => '#2E8B57',
                'icon' => 'User',
                'sort_order' => 22,
            ],
            [
                'name_en' => 'Seniors',
                'name_ar' => 'كبار السن',
                'slug' => 'seniors',
                'type' => 'age_group',
                'color' => '#8B4513',
                'icon' => 'UserRoundCog',
                'sort_order' => 23,
            ],

            // Styles
            [
                'name_en' => 'Elegant',
                'name_ar' => 'أنيق',
                'slug' => 'elegant',
                'type' => 'style',
                'color' => '#800080',
                'icon' => 'Sparkles',
                'sort_order' => 30,
            ],
            [
                'name_en' => 'Romantic',
                'name_ar' => 'رومانسي',
                'slug' => 'romantic',
                'type' => 'style',
                'color' => '#FF1493',
                'icon' => 'HeartHandshake',
                'sort_order' => 31,
            ],
            [
                'name_en' => 'Modern',
                'name_ar' => 'عصري',
                'slug' => 'modern',
                'type' => 'style',
                'color' => '#708090',
                'icon' => 'Zap',
                'sort_order' => 32,
            ],
            [
                'name_en' => 'Classic',
                'name_ar' => 'كلاسيكي',
                'slug' => 'classic',
                'type' => 'style',
                'color' => '#8B4513',
                'icon' => 'Crown',
                'sort_order' => 33,
            ],
            [
                'name_en' => 'Luxury',
                'name_ar' => 'فاخر',
                'slug' => 'luxury',
                'type' => 'style',
                'color' => '#FFD700',
                'icon' => 'Diamond',
                'sort_order' => 34,
            ],

            // Seasons
            [
                'name_en' => 'Spring',
                'name_ar' => 'ربيع',
                'slug' => 'spring',
                'type' => 'season',
                'color' => '#98FB98',
                'icon' => 'Flower',
                'sort_order' => 40,
            ],
            [
                'name_en' => 'Summer',
                'name_ar' => 'صيف',
                'slug' => 'summer',
                'type' => 'season',
                'color' => '#FFD700',
                'icon' => 'Sun',
                'sort_order' => 41,
            ],
            [
                'name_en' => 'Autumn',
                'name_ar' => 'خريف',
                'slug' => 'autumn',
                'type' => 'season',
                'color' => '#FF8C00',
                'icon' => 'Leaf',
                'sort_order' => 42,
            ],
            [
                'name_en' => 'Winter',
                'name_ar' => 'شتاء',
                'slug' => 'winter',
                'type' => 'season',
                'color' => '#87CEEB',
                'icon' => 'Snowflake',
                'sort_order' => 43,
            ],
        ];

        foreach ($tags as $tagData) {
            Tag::create($tagData);
        }
    }
}