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
                'slug' => 'skincare',
                'image_url' => '/images/categories/skincare.jpg',
                'translations' => [
                    'en' => [
                        'name' => 'Skincare',
                        'description' => 'Premium cleansers, moisturizers, and facial treatments',
                    ],
                    'ar' => [
                        'name' => 'العناية بالبشرة',
                        'description' => 'منظفات فاخرة، مرطبات، وعلاجات للوجه',
                    ],
                ],
            ],
            [
                'slug' => 'makeup',
                'image_url' => '/images/categories/makeup.jpg',
                'translations' => [
                    'en' => [
                        'name' => 'Makeup',
                        'description' => 'Professional cosmetics for face, eyes, and lips',
                    ],
                    'ar' => [
                        'name' => 'المكياج',
                        'description' => 'مستحضرات تجميل احترافية للوجه والعيون والشفاه',
                    ],
                ],
            ],
            [
                'slug' => 'hair-care',
                'image_url' => '/images/categories/hair-care.jpg',
                'translations' => [
                    'en' => [
                        'name' => 'Hair Care',
                        'description' => 'Shampoos, conditioners, and styling products',
                    ],
                    'ar' => [
                        'name' => 'العناية بالشعر',
                        'description' => 'شامبو، بلسم، ومنتجات تصفيف الشعر',
                    ],
                ],
            ],
            [
                'slug' => 'fragrances',
                'image_url' => '/images/categories/fragrances.jpg',
                'translations' => [
                    'en' => [
                        'name' => 'Fragrances',
                        'description' => 'Luxury perfumes and essential oil blends',
                    ],
                    'ar' => [
                        'name' => 'العطور',
                        'description' => 'عطور فاخرة ومزيج من الزيوت العطرية',
                    ],
                ],
            ],
            [
                'slug' => 'bath-body',
                'image_url' => '/images/categories/bath-body.jpg',
                'translations' => [
                    'en' => [
                        'name' => 'Bath & Body',
                        'description' => 'Relaxing bath salts, scrubs, and body lotions',
                    ],
                    'ar' => [
                        'name' => 'الاستحمام والجسم',
                        'description' => 'أملاح الاستحمام المريحة، المقشرات، ولوشن الجسم',
                    ],
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $categoryId = DB::table('categories')->insertGetId([
                'slug' => $categoryData['slug'],
                'image_url' => $categoryData['image_url'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

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