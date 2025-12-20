<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'slug' => 'flowers',
                'image_url' => '/images/categories/flowers.jpg',
                'translations' => [
                    'en' => [
                        'name' => 'Flowers',
                        'description' => 'Beautiful fresh flowers for every occasion',
                    ],
                    'ar' => [
                        'name' => 'الزهور',
                        'description' => 'زهور طازجة جميلة لكل المناسبات',
                    ],
                ],
            ],
            [
                'slug' => 'gift-boxes',
                'image_url' => '/images/categories/gift-boxes.jpg',
                'translations' => [
                    'en' => [
                        'name' => 'Gift Boxes',
                        'description' => 'Curated gift boxes for special moments',
                    ],
                    'ar' => [
                        'name' => 'صناديق الهدايا',
                        'description' => 'صناديق هدايا مختارة للحظات الخاصة',
                    ],
                ],
            ],
            [
                'slug' => 'chocolates',
                'image_url' => '/images/categories/chocolates.jpg',
                'translations' => [
                    'en' => [
                        'name' => 'Chocolates',
                        'description' => 'Premium chocolates and sweet treats',
                    ],
                    'ar' => [
                        'name' => 'الشوكولاتة',
                        'description' => 'شوكولاتة فاخرة وحلويات لذيذة',
                    ],
                ],
            ],
            [
                'slug' => 'perfumes',
                'image_url' => '/images/categories/perfumes.jpg',
                'translations' => [
                    'en' => [
                        'name' => 'Perfumes',
                        'description' => 'Luxury fragrances for him and her',
                    ],
                    'ar' => [
                        'name' => 'العطور',
                        'description' => 'عطور فاخرة للرجال والنساء',
                    ],
                ],
            ],
            [
                'slug' => 'accessories',
                'image_url' => '/images/categories/accessories.jpg',
                'translations' => [
                    'en' => [
                        'name' => 'Accessories',
                        'description' => 'Elegant accessories and decorative items',
                    ],
                    'ar' => [
                        'name' => 'الإكسسوارات',
                        'description' => 'إكسسوارات أنيقة وقطع ديكور',
                    ],
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            // Insert category
            $categoryId = DB::table('categories')->insertGetId([
                'slug' => $categoryData['slug'],
                'image_url' => $categoryData['image_url'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Insert translations
            foreach ($categoryData['translations'] as $locale => $translation) {
                DB::table('category_translations')->insert([
                    'category_id' => $categoryId,
                    'locale' => $locale,
                    'name' => $translation['name'],
                    'description' => $translation['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
