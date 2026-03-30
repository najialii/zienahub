<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubcategorySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get the tenant ID (or create one if the table is empty)
        $tenantId = DB::table('tenants')->value('id') ?? DB::table('tenants')->insertGetId([
            'name' => 'Bloomcart Store',
            'slug' => 'bloomcart',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $subcategories = [
            // Flowers subcategories
            [
                'category_slug' => 'flowers',
                'slug' => 'roses',
                'translations' => [
                    'en' => ['name' => 'Roses', 'description' => 'Classic roses in various colors'],
                    'ar' => ['name' => 'الورود', 'description' => 'ورود كلاسيكية بألوان متنوعة'],
                ],
            ],
            [
                'category_slug' => 'flowers',
                'slug' => 'tulips',
                'translations' => [
                    'en' => ['name' => 'Tulips', 'description' => 'Elegant tulips for spring'],
                    'ar' => ['name' => 'التوليب', 'description' => 'زهور التوليب الأنيقة للربيع'],
                ],
            ],
            [
                'category_slug' => 'flowers',
                'slug' => 'orchids',
                'translations' => [
                    'en' => ['name' => 'Orchids', 'description' => 'Exotic orchid arrangements'],
                    'ar' => ['name' => 'الأوركيد', 'description' => 'تنسيقات الأوركيد الغريبة'],
                ],
            ],
            
            // Gift Boxes subcategories
            [
                'category_slug' => 'gift-boxes',
                'slug' => 'birthday-gifts',
                'translations' => [
                    'en' => ['name' => 'Birthday Gifts', 'description' => 'Special boxes for birthdays'],
                    'ar' => ['name' => 'هدايا أعياد الميلاد', 'description' => 'صناديق خاصة لأعياد الميلاد'],
                ],
            ],
            [
                'category_slug' => 'gift-boxes',
                'slug' => 'wedding-gifts',
                'translations' => [
                    'en' => ['name' => 'Wedding Gifts', 'description' => 'Elegant wedding gift sets'],
                    'ar' => ['name' => 'هدايا الزفاف', 'description' => 'مجموعات هدايا زفاف أنيقة'],
                ],
            ],
            [
                'category_slug' => 'gift-boxes',
                'slug' => 'corporate-gifts',
                'translations' => [
                    'en' => ['name' => 'Corporate Gifts', 'description' => 'Professional gift boxes'],
                    'ar' => ['name' => 'الهدايا المؤسسية', 'description' => 'صناديق هدايا احترافية'],
                ],
            ],
            
            // Chocolates subcategories
            [
                'category_slug' => 'chocolates',
                'slug' => 'dark-chocolate',
                'translations' => [
                    'en' => ['name' => 'Dark Chocolate', 'description' => 'Rich dark chocolate selections'],
                    'ar' => ['name' => 'الشوكولاتة الداكنة', 'description' => 'تشكيلة شوكولاتة داكنة غنية'],
                ],
            ],
            [
                'category_slug' => 'chocolates',
                'slug' => 'milk-chocolate',
                'translations' => [
                    'en' => ['name' => 'Milk Chocolate', 'description' => 'Smooth milk chocolate treats'],
                    'ar' => ['name' => 'شوكولاتة الحليب', 'description' => 'حلويات شوكولاتة الحليب الناعمة'],
                ],
            ],
            [
                'category_slug' => 'chocolates',
                'slug' => 'assorted-chocolates',
                'translations' => [
                    'en' => ['name' => 'Assorted Chocolates', 'description' => 'Mixed chocolate collections'],
                    'ar' => ['name' => 'شوكولاتة متنوعة', 'description' => 'مجموعات شوكولاتة مختلطة'],
                ],
            ],
            
            // Perfumes subcategories
            [
                'category_slug' => 'perfumes',
                'slug' => 'mens-perfumes',
                'translations' => [
                    'en' => ['name' => "Men's Perfumes", 'description' => 'Masculine fragrances'],
                    'ar' => ['name' => 'عطور رجالية', 'description' => 'عطور رجولية'],
                ],
            ],
            [
                'category_slug' => 'perfumes',
                'slug' => 'womens-perfumes',
                'translations' => [
                    'en' => ['name' => "Women's Perfumes", 'description' => 'Feminine fragrances'],
                    'ar' => ['name' => 'عطور نسائية', 'description' => 'عطور أنثوية'],
                ],
            ],
            [
                'category_slug' => 'perfumes',
                'slug' => 'unisex-perfumes',
                'translations' => [
                    'en' => ['name' => 'Unisex Perfumes', 'description' => 'Fragrances for everyone'],
                    'ar' => ['name' => 'عطور للجنسين', 'description' => 'عطور للجميع'],
                ],
            ],
            
            // Accessories subcategories
            [
                'category_slug' => 'accessories',
                'slug' => 'jewelry',
                'translations' => [
                    'en' => ['name' => 'Jewelry', 'description' => 'Fine jewelry pieces'],
                    'ar' => ['name' => 'المجوهرات', 'description' => 'قطع مجوهرات فاخرة'],
                ],
            ],
            [
                'category_slug' => 'accessories',
                'slug' => 'home-decor',
                'translations' => [
                    'en' => ['name' => 'Home Decor', 'description' => 'Decorative home items'],
                    'ar' => ['name' => 'ديكور المنزل', 'description' => 'قطع ديكور منزلية'],
                ],
            ],
        ];

        foreach ($subcategories as $subcategoryData) {
            // 2. Get category ID scoped by the same tenant
            $categoryId = DB::table('categories')
                ->where('slug', $subcategoryData['category_slug'])
                ->where('tenant_id', $tenantId) // Added tenant check
                ->value('id');

            if (!$categoryId) continue;

            // 3. Insert subcategory with tenant_id
            $subcategoryId = DB::table('subcategories')->insertGetId([
                'tenant_id' => $tenantId, // <--- ADDED THIS
                'category_id' => $categoryId,
                'slug' => $subcategoryData['slug'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 4. Insert translations
            foreach ($subcategoryData['translations'] as $locale => $translation) {
                DB::table('subcategory_translations')->insert([
                    'subcategory_id' => $subcategoryId,
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