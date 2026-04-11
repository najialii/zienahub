<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubcategorySeeder extends Seeder
{
    public function run(): void
    {
        $subcategories = [
            // Skincare
            ['cat' => 'skincare', 'slug' => 'cleansers', 'en' => 'Cleansers', 'ar' => 'منظفات'],
            ['cat' => 'skincare', 'slug' => 'moisturizers', 'en' => 'Moisturizers', 'ar' => 'مرطبات'],
            ['cat' => 'skincare', 'slug' => 'serums', 'en' => 'Serums', 'ar' => 'سيروم'],
            
            // Makeup
            ['cat' => 'makeup', 'slug' => 'face-makeup', 'en' => 'Face', 'ar' => 'مكياج الوجه'],
            ['cat' => 'makeup', 'slug' => 'eye-makeup', 'en' => 'Eyes', 'ar' => 'مكياج العيون'],
            ['cat' => 'makeup', 'slug' => 'lips', 'en' => 'Lips', 'ar' => 'شفاه'],
            
            // Hair Care
            ['cat' => 'hair-care', 'slug' => 'shampoo', 'en' => 'Shampoo', 'ar' => 'شامبو'],
            ['cat' => 'hair-care', 'slug' => 'hair-treatments', 'en' => 'Treatments', 'ar' => 'علاجات الشعر'],
            
            // Fragrances
            ['cat' => 'fragrances', 'slug' => 'perfumes', 'en' => 'Perfumes', 'ar' => 'عطور'],
            ['cat' => 'fragrances', 'slug' => 'oud', 'en' => 'Oud', 'ar' => 'عود'],
        ];

        foreach ($subcategories as $data) {
            // Finding category based only on slug (global)
            $categoryId = DB::table('categories')->where('slug', $data['cat'])->value('id');

            if (!$categoryId) continue;

            DB::table('subcategories')->updateOrInsert(
                ['slug' => $data['slug']],
                ['category_id' => $categoryId, 'updated_at' => now(), 'created_at' => now()]
            );

            $subId = DB::table('subcategories')->where('slug', $data['slug'])->value('id');

            DB::table('subcategory_translations')->updateOrInsert(
                ['subcategory_id' => $subId, 'locale' => 'en'],
                ['name' => $data['en'], 'description' => $data['en'] . ' collection', 'updated_at' => now(), 'created_at' => now()]
            );
            DB::table('subcategory_translations')->updateOrInsert(
                ['subcategory_id' => $subId, 'locale' => 'ar'],
                ['name' => $data['ar'], 'description' => 'مجموعة ' . $data['ar'], 'updated_at' => now(), 'created_at' => now()]
            );
        }
    }
}