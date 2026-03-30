<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
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

        $availableImages = [
            '/storage/images/products/T68-3.jpg',
            '/storage/images/products/TEV75-2.jpg',
            '/storage/images/products/TWR04-1.jpg'
        ];

        $products = [
            // Roses
            [
                'subcategory_slug' => 'roses',
                'slug' => 'red-roses-bouquet',
                'price' => 49.99,
                'stock_quantity' => 50,
                'image_url' => $availableImages[0],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Red Roses Bouquet',
                        'description' => 'A stunning bouquet of 12 fresh red roses, perfect for expressing love and romance.',
                    ],
                    'ar' => [
                        'name' => 'باقة ورود حمراء',
                        'description' => 'باقة رائعة من 12 وردة حمراء طازجة، مثالية للتعبير عن الحب والرومانسية.',
                    ],
                ],
            ],
            [
                'subcategory_slug' => 'roses',
                'slug' => 'white-roses-arrangement',
                'price' => 54.99,
                'stock_quantity' => 40,
                'image_url' => $availableImages[1],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'White Roses Arrangement',
                        'description' => 'Elegant white roses arranged beautifully, symbolizing purity and new beginnings.',
                    ],
                    'ar' => [
                        'name' => 'تنسيق ورود بيضاء',
                        'description' => 'ورود بيضاء أنيقة منسقة بشكل جميل، ترمز للنقاء والبدايات الجديدة.',
                    ],
                ],
            ],
            [
                'subcategory_slug' => 'roses',
                'slug' => 'pink-roses-basket',
                'price' => 59.99,
                'stock_quantity' => 35,
                'image_url' => $availableImages[2],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Pink Roses Basket',
                        'description' => 'Charming pink roses in a decorative basket, ideal for celebrations and appreciation.',
                    ],
                    'ar' => [
                        'name' => 'سلة ورود وردية',
                        'description' => 'ورود وردية ساحرة في سلة زخرفية، مثالية للاحتفالات والتقدير.',
                    ],
                ],
            ],
            
            // Tulips
            [
                'subcategory_slug' => 'tulips',
                'slug' => 'mixed-tulips-bouquet',
                'price' => 44.99,
                'stock_quantity' => 45,
                'image_url' => $availableImages[0],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Mixed Tulips Bouquet',
                        'description' => 'Vibrant mixed tulips in various colors, bringing spring joy to any occasion.',
                    ],
                    'ar' => [
                        'name' => 'باقة توليب متنوعة',
                        'description' => 'توليب متنوع نابض بالحياة بألوان مختلفة، يجلب بهجة الربيع لأي مناسبة.',
                    ],
                ],
            ],
            
            // Orchids
            [
                'subcategory_slug' => 'orchids',
                'slug' => 'purple-orchid-plant',
                'price' => 79.99,
                'stock_quantity' => 25,
                'image_url' => $availableImages[1],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Purple Orchid Plant',
                        'description' => 'Exotic purple orchid in a ceramic pot, a long-lasting elegant gift.',
                    ],
                    'ar' => [
                        'name' => 'نبتة أوركيد بنفسجية',
                        'description' => 'أوركيد بنفسجي غريب في وعاء سيراميك، هدية أنيقة طويلة الأمد.',
                    ],
                ],
            ],
            
            // Birthday Gifts
            [
                'subcategory_slug' => 'birthday-gifts',
                'slug' => 'birthday-celebration-box',
                'price' => 89.99,
                'stock_quantity' => 30,
                'image_url' => $availableImages[2],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Birthday Celebration Box',
                        'description' => 'Complete birthday gift box with chocolates, flowers, and a greeting card.',
                    ],
                    'ar' => [
                        'name' => 'صندوق احتفال عيد الميلاد',
                        'description' => 'صندوق هدية عيد ميلاد كامل مع شوكولاتة وزهور وبطاقة تهنئة.',
                    ],
                ],
            ],
            
            // Wedding Gifts
            [
                'subcategory_slug' => 'wedding-gifts',
                'slug' => 'luxury-wedding-hamper',
                'price' => 149.99,
                'stock_quantity' => 20,
                'image_url' => $availableImages[0],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Luxury Wedding Hamper',
                        'description' => 'Premium wedding gift hamper with champagne, chocolates, and elegant accessories.',
                    ],
                    'ar' => [
                        'name' => 'سلة زفاف فاخرة',
                        'description' => 'سلة هدايا زفاف فاخرة مع شامبانيا وشوكولاتة وإكسسوارات أنيقة.',
                    ],
                ],
            ],
            
            // Corporate Gifts
            [
                'subcategory_slug' => 'corporate-gifts',
                'slug' => 'executive-gift-set',
                'price' => 129.99,
                'stock_quantity' => 40,
                'image_url' => $availableImages[1],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Executive Gift Set',
                        'description' => 'Professional gift set with premium pen, notebook, and gourmet treats.',
                    ],
                    'ar' => [
                        'name' => 'مجموعة هدايا تنفيذية',
                        'description' => 'مجموعة هدايا احترافية مع قلم فاخر ودفتر ملاحظات وحلويات راقية.',
                    ],
                ],
            ],
            
            // Dark Chocolate
            [
                'subcategory_slug' => 'dark-chocolate',
                'slug' => 'belgian-dark-chocolate-box',
                'price' => 34.99,
                'stock_quantity' => 60,
                'image_url' => $availableImages[2],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Belgian Dark Chocolate Box',
                        'description' => 'Artisan Belgian dark chocolate truffles, 70% cocoa content.',
                    ],
                    'ar' => [
                        'name' => 'علبة شوكولاتة بلجيكية داكنة',
                        'description' => 'كمأ شوكولاتة بلجيكية داكنة حرفية، محتوى كاكاو 70%.',
                    ],
                ],
            ],
            
            // Milk Chocolate
            [
                'subcategory_slug' => 'milk-chocolate',
                'slug' => 'swiss-milk-chocolate-collection',
                'price' => 29.99,
                'stock_quantity' => 70,
                'image_url' => $availableImages[0],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Swiss Milk Chocolate Collection',
                        'description' => 'Smooth Swiss milk chocolate in various flavors and shapes.',
                    ],
                    'ar' => [
                        'name' => 'مجموعة شوكولاتة حليب سويسرية',
                        'description' => 'شوكولاتة حليب سويسرية ناعمة بنكهات وأشكال متنوعة.',
                    ],
                ],
            ],
            
            // Men's Perfumes
            [
                'subcategory_slug' => 'mens-perfumes',
                'slug' => 'oud-wood-perfume',
                'price' => 119.99,
                'stock_quantity' => 30,
                'image_url' => $availableImages[1],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Oud Wood Perfume',
                        'description' => 'Luxurious oud wood fragrance with oriental notes, 100ml.',
                    ],
                    'ar' => [
                        'name' => 'عطر عود خشبي',
                        'description' => 'عطر عود خشبي فاخر بنفحات شرقية، 100 مل.',
                    ],
                ],
            ],
            
            // Women's Perfumes
            [
                'subcategory_slug' => 'womens-perfumes',
                'slug' => 'rose-garden-perfume',
                'price' => 99.99,
                'stock_quantity' => 35,
                'image_url' => $availableImages[2],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Rose Garden Perfume',
                        'description' => 'Elegant floral fragrance with rose and jasmine notes, 75ml.',
                    ],
                    'ar' => [
                        'name' => 'عطر حديقة الورد',
                        'description' => 'عطر زهري أنيق بنفحات الورد والياسمين، 75 مل.',
                    ],
                ],
            ],
            
            // Jewelry
            [
                'subcategory_slug' => 'jewelry',
                'slug' => 'silver-necklace-set',
                'price' => 159.99,
                'stock_quantity' => 25,
                'image_url' => $availableImages[0],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Silver Necklace Set',
                        'description' => 'Elegant sterling silver necklace and earrings set with cubic zirconia.',
                    ],
                    'ar' => [
                        'name' => 'طقم عقد فضي',
                        'description' => 'طقم عقد وأقراط فضة استرليني أنيق مع زركونيا مكعبة.',
                    ],
                ],
            ],
            
            // Home Decor
            [
                'subcategory_slug' => 'home-decor',
                'slug' => 'ceramic-vase-set',
                'price' => 69.99,
                'stock_quantity' => 40,
                'image_url' => $availableImages[1],
                'status' => 'active',
                'translations' => [
                    'en' => [
                        'name' => 'Ceramic Vase Set',
                        'description' => 'Modern ceramic vase set in monochromatic design, set of 3.',
                    ],
                    'ar' => [
                        'name' => 'طقم مزهريات سيراميك',
                        'description' => 'طقم مزهريات سيراميك عصري بتصميم أحادي اللون، مجموعة من 3.',
                    ],
                ],
            ],
        ];

        foreach ($products as $productData) {
            // Get subcategory ID scoped by tenant
            $subcategoryId = DB::table('subcategories')
                ->where('slug', $productData['subcategory_slug'])
                ->where('tenant_id', $tenantId) // Added tenant check
                ->value('id');

            if (!$subcategoryId) continue;

            // Insert product with tenant_id
            $productId = DB::table('products')->insertGetId([
                'tenant_id' => $tenantId, // <--- ADDED TENANT ID
                'subcategory_id' => $subcategoryId,
                'slug' => $productData['slug'],
                'price' => $productData['price'],
                'stock_quantity' => $productData['stock_quantity'],
                'image_url' => $productData['image_url'],
                'status' => $productData['status'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Insert translations
            foreach ($productData['translations'] as $locale => $translation) {
                DB::table('product_translations')->insert([
                    'product_id' => $productId,
                    'locale' => $locale,
                    'name' => $translation['name'],
                    'description' => $translation['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Assign tags to products based on product type and category
            $this->assignTagsToProduct($productId, $productData, $tenantId);
        }
    }

    private function assignTagsToProduct($productId, $productData, $tenantId)
    {
        $tagSlugs = [];

        // Assign tags based on subcategory
        switch ($productData['subcategory_slug']) {
            case 'roses':
            case 'tulips':
            case 'orchids':
                $tagSlugs = ['mothers-day', 'valentines-day', 'mother', 'wife', 'romantic', 'elegant'];
                break;
            
            case 'birthday-gifts':
                $tagSlugs = ['birthday', 'mother', 'father', 'wife', 'husband', 'sister', 'brother', 'friend'];
                break;
            
            case 'wedding-gifts':
                $tagSlugs = ['wedding', 'wife', 'husband', 'luxury', 'elegant'];
                break;
            
            case 'corporate-gifts':
                $tagSlugs = ['graduation', 'adults', 'modern', 'classic'];
                break;
            
            case 'dark-chocolate':
            case 'milk-chocolate':
                $tagSlugs = ['birthday', 'valentines-day', 'mother', 'wife', 'girlfriend', 'luxury'];
                break;
            
            case 'mens-perfumes':
                $tagSlugs = ['fathers-day', 'father', 'husband', 'boyfriend', 'brother', 'adults', 'luxury'];
                break;
            
            case 'womens-perfumes':
                $tagSlugs = ['mothers-day', 'mother', 'wife', 'girlfriend', 'sister', 'adults', 'luxury'];
                break;
            
            case 'jewelry':
                $tagSlugs = ['mothers-day', 'valentines-day', 'anniversary', 'wedding', 'mother', 'wife', 'girlfriend', 'sister', 'luxury', 'elegant'];
                break;
            
            case 'home-decor':
                $tagSlugs = ['wedding', 'anniversary', 'adults', 'modern', 'elegant'];
                break;
        }

        // Get tag IDs (filtered by tenant) and insert into pivot table
        foreach ($tagSlugs as $tagSlug) {
            $tagId = DB::table('tags')
                ->where('slug', $tagSlug)
                ->where('tenant_id', $tenantId) // Ensure tag belongs to same tenant
                ->value('id');

            if ($tagId) {
                DB::table('product_tag')->insert([
                    'product_id' => $productId,
                    'tag_id' => $tagId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}