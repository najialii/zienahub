<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Get all tenants
        $tenants = DB::table('tenants')->get();
        
        if ($tenants->isEmpty()) {
            $this->command->warn('No tenants found. Please run TenantSeeder first.');
            return;
        }

        // Get all subcategories with their slugs
        $subcategories = DB::table('subcategories')->get()->keyBy('slug');

        // Product templates for each tenant type
        $productTemplates = [
            'flower-paradise' => [
                [
                    'sub' => 'roses',
                    'slug' => 'red-rose-bouquet',
                    'price' => 250.00,
                    'img' => '/images/products/rose-bouquet.jpg',
                    'en' => ['name' => 'Classic Red Rose Bouquet', 'desc' => '12 fresh red roses elegantly arranged.'],
                    'ar' => ['name' => 'باقة ورد جوري كلاسيكية', 'desc' => '12 وردة حمراء طازجة مرتبة بأناقة.'],
                ],
                [
                    'sub' => 'mixed-bouquets',
                    'slug' => 'spring-mix-bouquet',
                    'price' => 180.00,
                    'img' => '/images/products/spring-mix.jpg',
                    'en' => ['name' => 'Spring Mix Bouquet', 'desc' => 'Colorful seasonal flowers arrangement.'],
                    'ar' => ['name' => 'باقة خليط الربيع', 'desc' => 'تشكيلة زهور موسمية ملونة.'],
                ],
                [
                    'sub' => 'vases',
                    'slug' => 'luxury-vase-arrangement',
                    'price' => 350.00,
                    'img' => '/images/products/vase-arrangement.jpg',
                    'en' => ['name' => 'Luxury Vase Arrangement', 'desc' => 'Premium flowers in elegant glass vase.'],
                    'ar' => ['name' => 'تنسيق مزهرية فاخر', 'desc' => 'زهور فاخرة في مزهرية زجاجية أنيقة.'],
                ],
            ],
            'gift-galaxy' => [
                [
                    'sub' => 'gift-boxes',
                    'slug' => 'luxury-gift-box',
                    'price' => 450.00,
                    'img' => '/images/products/luxury-gift-box.jpg',
                    'en' => ['name' => 'Luxury Gift Box', 'desc' => 'Premium assorted gifts in elegant box.'],
                    'ar' => ['name' => 'صندوق هدايا فاخر', 'desc' => 'هدايا متنوعة فاخرة في صندوق أنيق.'],
                ],
                [
                    'sub' => 'personalized-gifts',
                    'slug' => 'custom-photo-frame',
                    'price' => 120.00,
                    'img' => '/images/products/photo-frame.jpg',
                    'en' => ['name' => 'Custom Photo Frame', 'desc' => 'Personalized engraved photo frame.'],
                    'ar' => ['name' => 'برواز صور مخصص', 'desc' => 'برواز صور منحوت شخصيًا.'],
                ],
            ],
            'luxury-chocolates' => [
                [
                    'sub' => 'chocolates',
                    'slug' => 'belgian-chocolate-assortment',
                    'price' => 280.00,
                    'img' => '/images/products/chocolate-assortment.jpg',
                    'en' => ['name' => 'Belgian Chocolate Assortment', 'desc' => 'Premium Belgian chocolates collection.'],
                    'ar' => ['name' => 'تشكيلة شوكولاتة بلجيكية', 'desc' => 'مجموعة شوكولاتة بلجيكية فاخرة.'],
                ],
                [
                    'sub' => 'truffles',
                    'slug' => 'dark-chocolate-truffles',
                    'price' => 180.00,
                    'img' => '/images/products/truffles.jpg',
                    'en' => ['name' => 'Dark Chocolate Truffles', 'desc' => 'Rich dark chocolate truffles box.'],
                    'ar' => ['name' => 'ترافل شوكولاتة داكنة', 'desc' => 'صندوق ترافل شوكولاتة داكنة غنية.'],
                ],
            ],
            'perfume-palace' => [
                [
                    'sub' => 'perfumes',
                    'slug' => 'designer-perfume-50ml',
                    'price' => 650.00,
                    'img' => '/images/products/designer-perfume.jpg',
                    'en' => ['name' => 'Designer Perfume 50ml', 'desc' => 'Luxury designer fragrance.'],
                    'ar' => ['name' => 'عطر مصمم 50 مل', 'desc' => 'عطر فاخر من مصمم عالمي.'],
                ],
                [
                    'sub' => 'perfumes',
                    'slug' => 'oud-perfume-oil',
                    'price' => 450.00,
                    'img' => '/images/products/oud-oil.jpg',
                    'en' => ['name' => 'Premium Oud Perfume Oil', 'desc' => 'Pure oud oil concentrate.'],
                    'ar' => ['name' => 'زيت عود فاخر', 'desc' => 'تركيز زيت عود نقي.'],
                ],
            ],
            'beauty-box' => [
                [
                    'sub' => 'serums',
                    'slug' => 'vitamin-c-serum',
                    'price' => 220.00,
                    'img' => '/images/products/vitamin-c-serum.jpg',
                    'en' => ['name' => 'Vitamin C Brightening Serum', 'desc' => 'High concentration for glowing skin.'],
                    'ar' => ['name' => 'سيروم فيتامين سي للنضارة', 'desc' => 'تركيز عالي لبشرة مشرقة.'],
                ],
                [
                    'sub' => 'cleansers',
                    'slug' => 'gentle-face-wash',
                    'price' => 85.00,
                    'img' => '/images/products/face-wash.jpg',
                    'en' => ['name' => 'Gentle Cleansing Foam', 'desc' => 'Purifying foam for sensitive skin.'],
                    'ar' => ['name' => 'رغوة منظفة لطيفة', 'desc' => 'رغوة منقية للبشرة الحساسة.'],
                ],
                [
                    'sub' => 'lips',
                    'slug' => 'matte-lipstick-red',
                    'price' => 120.00,
                    'img' => '/images/products/lipstick.jpg',
                    'en' => ['name' => 'Velvet Matte Lipstick', 'desc' => 'Long-lasting vibrant red color.'],
                    'ar' => ['name' => 'أحمر شفاه مطفي', 'desc' => 'لون أحمر حيوي يدوم طويلاً.'],
                ],
            ],
            'cake-studio' => [
                [
                    'sub' => 'cakes',
                    'slug' => 'birthday-cake-chocolate',
                    'price' => 350.00,
                    'img' => '/images/products/chocolate-cake.jpg',
                    'en' => ['name' => 'Chocolate Birthday Cake', 'desc' => 'Rich chocolate cake for celebrations.'],
                    'ar' => ['name' => 'كعكة عيد ميلاد شوكولاتة', 'desc' => 'كعكة شوكولاتة غنية للاحتفالات.'],
                ],
                [
                    'sub' => 'cupcakes',
                    'slug' => 'assorted-cupcakes',
                    'price' => 120.00,
                    'img' => '/images/products/cupcakes.jpg',
                    'en' => ['name' => 'Assorted Cupcakes Box', 'desc' => '12 mixed flavor cupcakes.'],
                    'ar' => ['name' => 'صندوق كب كيك مشكل', 'desc' => '12 قطعة كب كيك بنكهات متنوعة.'],
                ],
            ],
            'balloon-world' => [
                [
                    'sub' => 'balloon-bouquets',
                    'slug' => 'helium-balloon-bouquet',
                    'price' => 150.00,
                    'img' => '/images/products/balloon-bouquet.jpg',
                    'en' => ['name' => 'Helium Balloon Bouquet', 'desc' => 'Colorful helium balloons arrangement.'],
                    'ar' => ['name' => 'باقة بالون هيليوم', 'desc' => 'تشكيلة بالون هيليوم ملونة.'],
                ],
                [
                    'sub' => 'balloon-decorations',
                    'slug' => 'birthday-balloon-arch',
                    'price' => 450.00,
                    'img' => '/images/products/balloon-arch.jpg',
                    'en' => ['name' => 'Birthday Balloon Arch', 'desc' => 'Custom balloon arch decoration.'],
                    'ar' => ['name' => 'قوس بالون لعيد الميلاد', 'desc' => 'ديكور قوس بالون مخصص.'],
                ],
            ],
            'candle-craft' => [
                [
                    'sub' => 'candles',
                    'slug' => 'scented-soy-candle',
                    'price' => 95.00,
                    'img' => '/images/products/soy-candle.jpg',
                    'en' => ['name' => 'Scented Soy Candle', 'desc' => 'Hand-poured natural soy wax candle.'],
                    'ar' => ['name' => 'شمعة صويا معطرة', 'desc' => 'شمعة شمع صويا طبيعي مصبوبة يدويًا.'],
                ],
                [
                    'sub' => 'candles',
                    'slug' => 'luxury-beeswax-candle',
                    'price' => 180.00,
                    'img' => '/images/products/beeswax-candle.jpg',
                    'en' => ['name' => 'Luxury Beeswax Candle', 'desc' => 'Premium natural beeswax candle.'],
                    'ar' => ['name' => 'شمعة عسل فاخرة', 'desc' => 'شمعة شمع عسل طبيعي فاخرة.'],
                ],
            ],
        ];

        $productCount = 0;
        $skippedCount = 0;

        foreach ($tenants as $tenant) {
            $tenantSlug = $tenant->slug;
            
            if (!isset($productTemplates[$tenantSlug])) {
                $skippedCount++;
                continue;
            }

            $products = $productTemplates[$tenantSlug];

            foreach ($products as $p) {
                // Check if subcategory exists
                if (!isset($subcategories[$p['sub']])) {
                    continue;
                }

                $subId = $subcategories[$p['sub']]->id;

                // Insert or update product
                $productId = DB::table('products')->updateOrInsert(
                    ['tenant_id' => $tenant->id, 'slug' => $p['slug']],
                    [
                        'subcategory_id' => $subId,
                        'price' => $p['price'],
                        'stock_quantity' => rand(10, 100),
                        'image_url' => $p['img'],
                        'status' => 'active',
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );

                // Get the actual product ID
                $product = DB::table('products')
                    ->where('tenant_id', $tenant->id)
                    ->where('slug', $p['slug'])
                    ->first();

                if ($product) {
                    // English Translation
                    DB::table('product_translations')->updateOrInsert(
                        ['product_id' => $product->id, 'locale' => 'en'],
                        [
                            'name' => $p['en']['name'],
                            'description' => $p['en']['desc'],
                            'updated_at' => now(),
                            'created_at' => now()
                        ]
                    );

                    // Arabic Translation
                    DB::table('product_translations')->updateOrInsert(
                        ['product_id' => $product->id, 'locale' => 'ar'],
                        [
                            'name' => $p['ar']['name'],
                            'description' => $p['ar']['desc'],
                            'updated_at' => now(),
                            'created_at' => now()
                        ]
                    );

                    $productCount++;
                }
            }
        }

        $this->command->info("Created/updated {$productCount} products across all tenants.");
        if ($skippedCount > 0) {
            $this->command->warn("Skipped {$skippedCount} tenants (no product templates defined).");
        }
    }
}