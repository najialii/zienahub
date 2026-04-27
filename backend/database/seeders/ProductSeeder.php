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
                    'brand' => 'Flower Paradise',
                    'size' => '12 Stems',
                    'country_of_origin' => 'Ecuador',
                    'en' => [
                        'name' => 'Classic Red Rose Bouquet',
                        'desc' => 'A stunning arrangement of 12 premium long-stem red roses, hand-selected from the finest Ecuadorian farms. Each rose is carefully arranged and wrapped in luxury tissue paper with a satin ribbon finish.',
                        'how_to_use' => "1. Remove the bouquet from its packaging carefully\n2. Trim 2cm off each stem at a 45° angle\n3. Place in a clean vase with fresh water\n4. Add the included flower food sachet\n5. Keep away from direct sunlight and heat\n6. Change the water every 2 days for maximum freshness",
                        'ingredients' => '12 Premium Red Roses (Rosa × centifolia), Eucalyptus greenery, Baby\'s Breath (Gypsophila), Luxury tissue wrap, Satin ribbon, Flower food sachet',
                        'benefits' => "• Premium Grade A roses sourced directly from Ecuador\n• Long-lasting freshness guaranteed for 7-10 days\n• Hand-arranged by expert florists\n• Eco-friendly biodegradable packaging\n• Includes complimentary flower food",
                    ],
                    'ar' => [
                        'name' => 'باقة ورد جوري كلاسيكية',
                        'desc' => 'تنسيق مذهل من 12 وردة جوري حمراء فاخرة طويلة الساق، مختارة يدويًا من أفضل مزارع الإكوادور. كل وردة مرتبة بعناية ومغلفة بورق فاخر مع شريط ساتان.',
                        'how_to_use' => "1. أزل الباقة من غلافها بعناية\n2. قص 2 سم من كل ساق بزاوية 45 درجة\n3. ضعها في مزهرية نظيفة بماء عذب\n4. أضف كيس غذاء الزهور المرفق\n5. أبعدها عن أشعة الشمس المباشرة والحرارة\n6. غيّر الماء كل يومين لأقصى نضارة",
                        'ingredients' => '12 وردة جوري حمراء فاخرة، أوراق أوكالبتوس، زهور الجيبسوفيلا، غلاف ورقي فاخر، شريط ساتان، كيس غذاء الزهور',
                        'benefits' => "• ورود درجة أولى مستوردة مباشرة من الإكوادور\n• نضارة مضمونة تدوم 7-10 أيام\n• مرتبة يدويًا بواسطة خبراء تنسيق الزهور\n• تغليف صديق للبيئة\n• غذاء زهور مجاني مرفق",
                    ],
                ],
                [
                    'sub' => 'mixed-bouquets',
                    'slug' => 'spring-mix-bouquet',
                    'price' => 180.00,
                    'img' => '/images/products/spring-mix.jpg',
                    'brand' => 'Flower Paradise',
                    'size' => '15 Stems',
                    'country_of_origin' => 'Netherlands',
                    'en' => [
                        'name' => 'Spring Mix Bouquet',
                        'desc' => 'A vibrant collection of seasonal spring flowers including tulips, daisies, and lilies. Sourced from the finest Dutch greenhouses for maximum color and freshness.',
                        'how_to_use' => "1. Unwrap the bouquet gently\n2. Trim stems at 45° angle under water\n3. Place in clean vase with lukewarm water\n4. Remove any leaves that fall below the waterline\n5. Display in a cool, well-lit area",
                        'ingredients' => 'Tulips, Daisies, Lilies, Seasonal greenery, Decorative wrap, Ribbon',
                        'benefits' => "• Dutch-sourced premium seasonal blooms\n• Vibrant colors that brighten any room\n• Freshness guaranteed for 5-7 days\n• Perfect for any occasion",
                    ],
                    'ar' => [
                        'name' => 'باقة خليط الربيع',
                        'desc' => 'مجموعة متألقة من زهور الربيع الموسمية تشمل التوليب والأقحوان والزنبق. مستوردة من أفضل البيوت الزجاجية الهولندية.',
                        'how_to_use' => "1. افتح الباقة برفق\n2. قص الساق بزاوية 45 درجة تحت الماء\n3. ضعها في مزهرية نظيفة بماء فاتر\n4. أزل أي أوراق تحت خط الماء\n5. اعرضها في مكان بارد ومضاء",
                        'ingredients' => 'توليب، أقحوان، زنبق، أوراق خضراء موسمية، غلاف مزخرف، شريط',
                        'benefits' => "• زهور موسمية فاخرة من هولندا\n• ألوان زاهية تضيء أي غرفة\n• نضارة مضمونة 5-7 أيام\n• مثالية لأي مناسبة",
                    ],
                ],
                [
                    'sub' => 'vases',
                    'slug' => 'luxury-vase-arrangement',
                    'price' => 350.00,
                    'img' => '/images/products/vase-arrangement.jpg',
                    'brand' => 'Flower Paradise',
                    'size' => 'Medium (30cm)',
                    'country_of_origin' => 'Saudi Arabia',
                    'en' => [
                        'name' => 'Luxury Vase Arrangement',
                        'desc' => 'Premium flowers artfully arranged in an elegant hand-blown glass vase. A lasting centerpiece featuring roses, hydrangeas, and seasonal accents.',
                        'how_to_use' => "1. Remove protective packaging\n2. Add water to keep the floral foam saturated\n3. Place on a flat, stable surface away from direct sunlight\n4. Top up water daily\n5. Mist flowers lightly every other day",
                        'ingredients' => 'Roses, Hydrangeas, Seasonal accents, Eucalyptus, Hand-blown glass vase, Floral foam, Decorative stones',
                        'benefits' => "• Ready-to-display arrangement — no vase needed\n• Hand-blown artisan glass vase included\n• Premium Grade A flowers\n• Lasts 10-14 days with proper care\n• Perfect luxury gift",
                    ],
                    'ar' => [
                        'name' => 'تنسيق مزهرية فاخر',
                        'desc' => 'زهور فاخرة منسقة بفن في مزهرية زجاجية أنيقة مصنوعة يدويًا. قطعة مركزية رائعة تضم ورود وهيدرانجيا.',
                        'how_to_use' => "1. أزل التغليف الواقي\n2. أضف الماء للحفاظ على رطوبة الإسفنج\n3. ضعها على سطح مستقر بعيد عن الشمس\n4. أعد تعبئة الماء يوميًا\n5. رش الزهور برذاذ خفيف كل يومين",
                        'ingredients' => 'ورود، هيدرانجيا، إضافات موسمية، أوكالبتوس، مزهرية زجاجية يدوية الصنع، إسفنج زهري، حجارة مزخرفة',
                        'benefits' => "• تنسيق جاهز للعرض — لا حاجة لمزهرية\n• مزهرية زجاجية حرفية مرفقة\n• زهور درجة أولى\n• تدوم 10-14 يوم\n• هدية فاخرة مثالية",
                    ],
                ],
            ],
            'gift-galaxy' => [
                [
                    'sub' => 'gift-boxes',
                    'slug' => 'luxury-gift-box',
                    'price' => 450.00,
                    'img' => '/images/products/luxury-gift-box.jpg',
                    'brand' => 'Gift Galaxy',
                    'size' => 'Large Box (40x30x15 cm)',
                    'country_of_origin' => 'Saudi Arabia',
                    'en' => [
                        'name' => 'Luxury Gift Box',
                        'desc' => 'A beautifully curated gift box containing premium chocolates, scented candle, silk scarf, and a handwritten card. Wrapped in premium matte-finish packaging.',
                        'how_to_use' => "Simply open the magnetic-closure box and discover each item nestled in satin fabric. Each product comes individually wrapped for a premium gifting experience.",
                        'ingredients' => 'Premium Belgian chocolates (200g), Scented soy candle, Silk scarf, Handwritten greeting card, Matte-finish gift box, Satin interior lining',
                        'benefits' => "• Curated by expert gift designers\n• Premium magnetic-closure box\n• Each item individually wrapped\n• Free gift card with personalized message\n• Ready to gift — no additional wrapping needed",
                    ],
                    'ar' => [
                        'name' => 'صندوق هدايا فاخر',
                        'desc' => 'صندوق هدايا منتقى بعناية يحتوي على شوكولاتة فاخرة وشمعة معطرة ووشاح حرير وبطاقة مكتوبة بخط اليد.',
                        'how_to_use' => "افتح الصندوق المغناطيسي واكتشف كل قطعة منسقة في قماش ساتان. كل منتج مغلف بشكل فردي لتجربة فاخرة.",
                        'ingredients' => 'شوكولاتة بلجيكية فاخرة (200 غرام)، شمعة صويا معطرة، وشاح حرير، بطاقة تهنئة يدوية، علبة بتشطيب مطفي',
                        'benefits' => "• منتقى بواسطة خبراء الهدايا\n• علبة بإغلاق مغناطيسي\n• كل قطعة مغلفة بشكل فردي\n• بطاقة تهنئة مجانية\n• جاهز للإهداء فورًا",
                    ],
                ],
                [
                    'sub' => 'personalized-gifts',
                    'slug' => 'custom-photo-frame',
                    'price' => 120.00,
                    'img' => '/images/products/photo-frame.jpg',
                    'brand' => 'Gift Galaxy',
                    'size' => '8x10 inches',
                    'country_of_origin' => 'Turkey',
                    'en' => [
                        'name' => 'Custom Photo Frame',
                        'desc' => 'Personalized engraved wooden photo frame with custom text. Handcrafted from sustainably sourced walnut wood with a natural matte finish.',
                        'how_to_use' => "1. Insert your 8x10 inch photo through the back panel\n2. Secure with the included clips\n3. Stand on any flat surface using the built-in easel back\n4. Or hang on wall using the built-in hook",
                        'ingredients' => 'Sustainably sourced walnut wood, Tempered glass front, Velvet backing, Stainless steel clips, Built-in easel stand',
                        'benefits' => "• Laser-engraved personalization\n• Sustainably sourced walnut wood\n• Dual display: wall mount or tabletop\n• Scratch-resistant tempered glass\n• Gift-boxed",
                    ],
                    'ar' => [
                        'name' => 'برواز صور مخصص',
                        'desc' => 'برواز صور خشبي محفور بنص مخصص. مصنوع يدويًا من خشب الجوز المستدام بتشطيب مطفي طبيعي.',
                        'how_to_use' => "1. أدخل صورتك مقاس 8×10 إنش من الخلف\n2. ثبتها بالمشابك المرفقة\n3. ضعه على أي سطح مستوي باستخدام حامل خلفي\n4. أو علقه على الجدار",
                        'ingredients' => 'خشب جوز مستدام، زجاج مقسى، بطانة مخملية، مشابك ستانلس ستيل، حامل مدمج',
                        'benefits' => "• نقش بالليزر مخصص\n• خشب جوز مستدام\n• عرض مزدوج: جدار أو طاولة\n• زجاج مقسى مقاوم للخدش\n• معبأ في علبة هدايا",
                    ],
                ],
            ],
            'luxury-chocolates' => [
                [
                    'sub' => 'chocolates',
                    'slug' => 'belgian-chocolate-assortment',
                    'price' => 280.00,
                    'img' => '/images/products/chocolate-assortment.jpg',
                    'brand' => 'Godiva',
                    'size' => '500g (24 pieces)',
                    'country_of_origin' => 'Belgium',
                    'en' => [
                        'name' => 'Belgian Chocolate Assortment',
                        'desc' => 'A premium collection of 24 handcrafted Belgian chocolates featuring dark, milk, and white varieties. Each piece is filled with ganache, praline, or caramel.',
                        'how_to_use' => "Store in a cool, dry place (16-18°C). Best enjoyed at room temperature. Remove from refrigerator 30 minutes before serving for optimal flavor.",
                        'ingredients' => 'Cocoa mass, Cocoa butter, Sugar, Whole milk powder, Hazelnuts (Turkey), Almonds, Vanilla extract, Soy lecithin. May contain traces of gluten.',
                        'benefits' => "• Handcrafted by master Belgian chocolatiers\n• 100% sustainably sourced cocoa\n• No artificial flavors or preservatives\n• Elegant presentation box\n• Perfect as corporate or personal gift",
                    ],
                    'ar' => [
                        'name' => 'تشكيلة شوكولاتة بلجيكية',
                        'desc' => 'مجموعة فاخرة من 24 قطعة شوكولاتة بلجيكية مصنوعة يدوياً بأنواع الداكنة والحليب والبيضاء.',
                        'how_to_use' => "تُحفظ في مكان بارد وجاف (16-18 درجة). يُفضل تناولها بدرجة حرارة الغرفة. أخرجها من الثلاجة 30 دقيقة قبل التقديم.",
                        'ingredients' => 'كتلة كاكاو، زبدة كاكاو، سكر، حليب بودرة كامل الدسم، بندق، لوز، خلاصة فانيليا، ليسيثين الصويا',
                        'benefits' => "• مصنوعة يدوياً بواسطة خبراء الشوكولاتة البلجيكيين\n• كاكاو مستدام 100%\n• بدون نكهات صناعية أو مواد حافظة\n• علبة تقديم أنيقة\n• مثالية للإهداء",
                    ],
                ],
                [
                    'sub' => 'truffles',
                    'slug' => 'dark-chocolate-truffles',
                    'price' => 180.00,
                    'img' => '/images/products/truffles.jpg',
                    'brand' => 'Lindt',
                    'size' => '250g (16 pieces)',
                    'country_of_origin' => 'Switzerland',
                    'en' => [
                        'name' => 'Dark Chocolate Truffles',
                        'desc' => 'Rich dark chocolate truffles with a smooth ganache center. Made with 70% single-origin cocoa from Ghana for an intense flavor experience.',
                        'how_to_use' => "Best enjoyed at room temperature. Remove from packaging 15 minutes before serving. Pair with espresso or a full-bodied red wine for maximum enjoyment.",
                        'ingredients' => 'Dark chocolate (70% cocoa), Cream, Butter, Cocoa powder, Vanilla bean, Sea salt',
                        'benefits' => "• 70% single-origin Ghanaian cocoa\n• Rich in antioxidants\n• No artificial additives\n• Gluten-free\n• Premium gift packaging",
                    ],
                    'ar' => [
                        'name' => 'ترافل شوكولاتة داكنة',
                        'desc' => 'ترافل شوكولاتة داكنة غنية بحشوة غاناش ناعمة. مصنوعة من كاكاو غانا بنسبة 70%.',
                        'how_to_use' => "يُفضل تناولها بدرجة حرارة الغرفة. أخرجها 15 دقيقة قبل التقديم. يُقدم مع الإسبريسو أو النبيذ الأحمر.",
                        'ingredients' => 'شوكولاتة داكنة (70% كاكاو)، كريمة، زبدة، مسحوق كاكاو، فانيليا، ملح بحري',
                        'benefits' => "• كاكاو غاني بنسبة 70%\n• غني بمضادات الأكسدة\n• بدون إضافات صناعية\n• خالي من الغلوتين\n• تعبئة هدايا فاخرة",
                    ],
                ],
            ],
            'perfume-palace' => [
                [
                    'sub' => 'perfumes',
                    'slug' => 'designer-perfume-50ml',
                    'price' => 650.00,
                    'img' => '/images/products/designer-perfume.jpg',
                    'brand' => 'Tom Ford',
                    'size' => '50ml EDP',
                    'country_of_origin' => 'France',
                    'en' => [
                        'name' => 'Designer Perfume 50ml',
                        'desc' => 'A sophisticated eau de parfum with top notes of bergamot and pink pepper, heart notes of rose and jasmine, and base notes of sandalwood and musk.',
                        'how_to_use' => "1. Apply to pulse points: wrists, neck, behind ears\n2. Spray from 15-20 cm distance\n3. Do not rub after spraying — let it dry naturally\n4. Layer with the matching body lotion for longer lasting scent\n5. Store upright in a cool, dark place",
                        'ingredients' => 'Alcohol Denat., Aqua, Parfum, Limonene, Linalool, Citronellol, Geraniol, Coumarin, Benzyl Benzoate, Benzyl Alcohol',
                        'benefits' => "• Long-lasting 8-12 hour performance\n• Versatile day-to-night fragrance\n• Crafted by master perfumers in Grasse, France\n• Premium glass bottle with magnetic cap\n• Unisex appeal",
                    ],
                    'ar' => [
                        'name' => 'عطر مصمم 50 مل',
                        'desc' => 'عطر أو دي بارفيوم راقٍ بمقدمة من البرغموت والفلفل الوردي، وقلب من الورد والياسمين، وقاعدة من خشب الصندل والمسك.',
                        'how_to_use' => "1. ضعه على نقاط النبض: المعصمين، الرقبة، خلف الأذنين\n2. رش من مسافة 15-20 سم\n3. لا تفرك — اتركه يجف طبيعياً\n4. طبّق مع لوشن الجسم المطابق لرائحة أطول\n5. خزّنه في مكان بارد ومظلم",
                        'ingredients' => 'كحول، ماء، عطر، ليمونين، لينالول، سيترونيلول، جيرانيول، كومارين',
                        'benefits' => "• أداء يدوم 8-12 ساعة\n• عطر متعدد الاستخدامات نهاري ومسائي\n• من صناعة خبراء العطور في غراس، فرنسا\n• زجاجة فاخرة بغطاء مغناطيسي\n• مناسب للجنسين",
                    ],
                ],
                [
                    'sub' => 'perfumes',
                    'slug' => 'oud-perfume-oil',
                    'price' => 450.00,
                    'img' => '/images/products/oud-oil.jpg',
                    'brand' => 'Abdul Samad Al Qurashi',
                    'size' => '12ml Oil',
                    'country_of_origin' => 'Saudi Arabia',
                    'en' => [
                        'name' => 'Premium Oud Perfume Oil',
                        'desc' => 'Pure oud oil concentrate distilled from aged Cambodian Aquilaria trees. A warm, woody, and deeply complex fragrance prized for centuries in Arabian culture.',
                        'how_to_use' => "1. Apply a small amount to pulse points using the built-in applicator\n2. A little goes a long way — start with a single dot\n3. Allow 10 minutes for the scent to develop fully on skin\n4. Reapply as desired throughout the day",
                        'ingredients' => '100% Pure Oud Oil (Aquilaria malaccensis), distilled from sustainably harvested aged agarwood',
                        'benefits' => "• 100% pure — no synthetic fillers\n• Sustainably harvested agarwood\n• Aged for 20+ years for maximum depth\n• Long-lasting 24-hour projection\n• Traditional Arabian heritage",
                    ],
                    'ar' => [
                        'name' => 'زيت عود فاخر',
                        'desc' => 'تركيز زيت عود نقي مقطر من أشجار أكيلاريا الكمبودية المعتقة. رائحة دافئة خشبية معقدة.',
                        'how_to_use' => "1. ضع كمية صغيرة على نقاط النبض\n2. كمية قليلة تكفي — ابدأ بنقطة واحدة\n3. انتظر 10 دقائق حتى تتطور الرائحة\n4. أعد الاستخدام حسب الرغبة",
                        'ingredients' => 'زيت عود نقي 100% (أكيلاريا مالاكنسيس)، مقطر من خشب العود المحصود بشكل مستدام',
                        'benefits' => "• نقي 100% — بدون مواد صناعية\n• خشب عود محصود بشكل مستدام\n• معتق لأكثر من 20 عاماً\n• يدوم 24 ساعة\n• تراث عربي أصيل",
                    ],
                ],
            ],
            'beauty-box' => [
                [
                    'sub' => 'serums',
                    'slug' => 'vitamin-c-serum',
                    'price' => 220.00,
                    'img' => '/images/products/vitamin-c-serum.jpg',
                    'brand' => 'The Ordinary',
                    'size' => '30ml',
                    'country_of_origin' => 'Canada',
                    'en' => [
                        'name' => 'Vitamin C Brightening Serum',
                        'desc' => 'A potent 20% Vitamin C serum with Hyaluronic Acid and Vitamin E for visibly brighter, smoother skin. Clinically tested to reduce dark spots in 4 weeks.',
                        'how_to_use' => "1. Cleanse face thoroughly\n2. Apply 3-4 drops to fingertips\n3. Gently pat onto face and neck, avoiding eye area\n4. Follow with moisturizer and sunscreen (AM)\n5. Use once daily, preferably in the morning\n6. Allow 1-2 minutes to absorb before applying next product",
                        'ingredients' => 'Aqua, Ascorbic Acid (20%), Hyaluronic Acid, Tocopherol (Vitamin E), Ferulic Acid, Propanediol, Panthenol, Glycerin, Sodium Hydroxide, Phenoxyethanol',
                        'benefits' => "• 20% pure L-Ascorbic Acid concentration\n• Reduces dark spots and hyperpigmentation\n• Boosts collagen production\n• Protects against UV damage\n• Dermatologist tested\n• Suitable for all skin types\n• Vegan & cruelty-free",
                    ],
                    'ar' => [
                        'name' => 'سيروم فيتامين سي للنضارة',
                        'desc' => 'سيروم فيتامين سي بتركيز 20% مع حمض الهيالورونيك وفيتامين إي لبشرة أكثر إشراقاً ونعومة.',
                        'how_to_use' => "1. نظفي الوجه جيداً\n2. ضعي 3-4 قطرات على أطراف الأصابع\n3. اتركيه على الوجه والرقبة بلطف، تجنبي منطقة العين\n4. اتبعيه بالمرطب وواقي الشمس (صباحاً)\n5. استخدميه مرة يومياً\n6. انتظري 1-2 دقيقة للامتصاص",
                        'ingredients' => 'ماء، حمض الأسكوربيك (20%)، حمض الهيالورونيك، توكوفيرول (فيتامين إي)، حمض الفيروليك، بانثينول، غليسرين',
                        'benefits' => "• تركيز 20% من فيتامين سي النقي\n• يقلل البقع الداكنة\n• يعزز إنتاج الكولاجين\n• يحمي من أضرار الأشعة\n• مختبر من أطباء الجلدية\n• مناسب لجميع أنواع البشرة\n• نباتي وخالٍ من القسوة",
                    ],
                ],
                [
                    'sub' => 'cleansers',
                    'slug' => 'gentle-face-wash',
                    'price' => 85.00,
                    'img' => '/images/products/face-wash.jpg',
                    'brand' => 'CeraVe',
                    'size' => '236ml',
                    'country_of_origin' => 'USA',
                    'en' => [
                        'name' => 'Gentle Cleansing Foam',
                        'desc' => 'A gentle yet effective foaming cleanser formulated with 3 essential ceramides and niacinamide. Removes dirt, oil, and makeup without disrupting the skin barrier.',
                        'how_to_use' => "1. Wet face with lukewarm water\n2. Pump 1-2 pumps into hands\n3. Gently massage onto face in circular motions for 30-60 seconds\n4. Rinse thoroughly with lukewarm water\n5. Pat dry with a clean towel\n6. Use morning and evening",
                        'ingredients' => 'Aqua, Glycerin, Coco-Betaine, Ceramide NP, Ceramide AP, Ceramide EOP, Niacinamide, Phytosphingosine, Cholesterol, Sodium Lauroyl Lactylate, Hyaluronic Acid',
                        'benefits' => "• 3 essential ceramides for barrier repair\n• Non-stripping formula\n• Fragrance-free\n• pH-balanced (5.5)\n• Dermatologist recommended\n• Suitable for sensitive skin",
                    ],
                    'ar' => [
                        'name' => 'رغوة منظفة لطيفة',
                        'desc' => 'رغوة منظفة لطيفة وفعالة بتركيبة 3 سيراميدات أساسية ونياسيناميد.',
                        'how_to_use' => "1. بللي الوجه بماء فاتر\n2. ضعي 1-2 ضخة على اليدين\n3. دلكي الوجه بحركات دائرية 30-60 ثانية\n4. اشطفي جيداً بماء فاتر\n5. جففي بمنشفة نظيفة\n6. استخدميه صباحاً ومساءً",
                        'ingredients' => 'ماء، غليسرين، كوكو-بيتاين، سيراميد NP، سيراميد AP، سيراميد EOP، نياسيناميد، حمض الهيالورونيك',
                        'benefits' => "• 3 سيراميدات أساسية لإصلاح الحاجز\n• تركيبة لا تجرد البشرة\n• خالية من العطور\n• متوازنة الحموضة (5.5)\n• موصى بها من أطباء الجلدية\n• مناسبة للبشرة الحساسة",
                    ],
                ],
                [
                    'sub' => 'lips',
                    'slug' => 'matte-lipstick-red',
                    'price' => 120.00,
                    'img' => '/images/products/lipstick.jpg',
                    'brand' => 'MAC',
                    'size' => '3g',
                    'country_of_origin' => 'Italy',
                    'en' => [
                        'name' => 'Velvet Matte Lipstick',
                        'desc' => 'A long-lasting velvet matte lipstick in a vibrant red shade. Enriched with jojoba oil for comfortable wear without drying. Transfer-proof for up to 8 hours.',
                        'how_to_use' => "1. Exfoliate and moisturize lips first\n2. Optionally line lips with a matching lip liner\n3. Apply directly from the bullet or use a lip brush\n4. Start from the center and work outward\n5. Blot with tissue and reapply for full coverage",
                        'ingredients' => 'Isododecane, Dimethicone, Trimethylsiloxysilicate, Jojoba Esters, Simmondsia Chinensis (Jojoba) Seed Oil, Tocopheryl Acetate (Vitamin E), CI 15850, CI 77891',
                        'benefits' => "• Velvet matte finish — not flat or chalky\n• Transfer-proof up to 8 hours\n• Enriched with jojoba oil for comfort\n• Full coverage in one swipe\n• Cruelty-free & vegan",
                    ],
                    'ar' => [
                        'name' => 'أحمر شفاه مطفي',
                        'desc' => 'أحمر شفاه مطفي بتشطيب مخملي يدوم طويلاً بلون أحمر زاهٍ. معزز بزيت الجوجوبا لراحة دون جفاف.',
                        'how_to_use' => "1. قشري ورطبي الشفاه أولاً\n2. ارسمي خط الشفاه بقلم مناسب\n3. ضعيه مباشرة أو بفرشاة\n4. ابدئي من المنتصف للخارج\n5. امسحي بمنديل وأعيدي التطبيق",
                        'ingredients' => 'إيزودوديكان، ديميثيكون، زيت الجوجوبا، توكوفيريل أسيتات (فيتامين إي)',
                        'benefits' => "• تشطيب مطفي مخملي\n• مقاوم للنقل حتى 8 ساعات\n• معزز بزيت الجوجوبا\n• تغطية كاملة بطبقة واحدة\n• نباتي وخالٍ من القسوة",
                    ],
                ],
            ],
            'cake-studio' => [
                [
                    'sub' => 'cakes',
                    'slug' => 'birthday-cake-chocolate',
                    'price' => 350.00,
                    'img' => '/images/products/chocolate-cake.jpg',
                    'brand' => 'Cake Studio',
                    'size' => '1.5 kg (Serves 10-12)',
                    'country_of_origin' => 'Saudi Arabia',
                    'en' => [
                        'name' => 'Chocolate Birthday Cake',
                        'desc' => 'A triple-layer rich chocolate cake with Belgian chocolate ganache frosting and chocolate shavings. Made fresh daily with premium ingredients.',
                        'how_to_use' => "1. Remove from refrigerator 30 minutes before serving\n2. Use a sharp knife dipped in warm water for clean slices\n3. Best consumed within 3 days of purchase\n4. Store in refrigerator at 2-6°C\n5. Can add your own candles and decorations",
                        'ingredients' => 'Flour, Sugar, Eggs, Butter, Dutch-process cocoa, Belgian dark chocolate (70%), Heavy cream, Vanilla extract, Baking soda, Salt',
                        'benefits' => "• Freshly baked daily — never frozen\n• Made with 70% Belgian dark chocolate\n• No artificial preservatives\n• Customizable with name and message\n• Includes birthday candles set",
                    ],
                    'ar' => [
                        'name' => 'كعكة عيد ميلاد شوكولاتة',
                        'desc' => 'كعكة شوكولاتة ثلاثية الطبقات مع صوص غاناش شوكولاتة بلجيكية. تُصنع طازجة يومياً.',
                        'how_to_use' => "1. أخرجها من الثلاجة 30 دقيقة قبل التقديم\n2. استخدم سكين حاد مغموس بماء دافئ\n3. يُفضل تناولها خلال 3 أيام\n4. تُحفظ في الثلاجة 2-6 درجة\n5. يمكن إضافة الشموع والزينة",
                        'ingredients' => 'طحين، سكر، بيض، زبدة، كاكاو، شوكولاتة بلجيكية داكنة (70%)، كريمة ثقيلة، فانيليا',
                        'benefits' => "• تُخبز طازجة يومياً\n• مصنوعة من شوكولاتة بلجيكية 70%\n• بدون مواد حافظة صناعية\n• قابلة للتخصيص بالاسم والرسالة\n• شموع عيد الميلاد مرفقة",
                    ],
                ],
                [
                    'sub' => 'cupcakes',
                    'slug' => 'assorted-cupcakes',
                    'price' => 120.00,
                    'img' => '/images/products/cupcakes.jpg',
                    'brand' => 'Cake Studio',
                    'size' => '12 pieces',
                    'country_of_origin' => 'Saudi Arabia',
                    'en' => [
                        'name' => 'Assorted Cupcakes Box',
                        'desc' => '12 mixed flavor cupcakes including vanilla, chocolate, red velvet, and salted caramel. Each topped with buttercream swirls and decorative sprinkles.',
                        'how_to_use' => "Best served at room temperature. Remove from packaging 15 minutes before serving. Can be refrigerated for up to 3 days.",
                        'ingredients' => 'Flour, Sugar, Eggs, Butter, Cream cheese, Cocoa, Vanilla, Red food coloring (natural beetroot), Caramel, Sea salt, Sprinkles',
                        'benefits' => "• 4 unique flavors in every box\n• Freshly baked with premium butter\n• Natural food coloring\n• Perfect for parties and events\n• Beautiful presentation packaging",
                    ],
                    'ar' => [
                        'name' => 'صندوق كب كيك مشكل',
                        'desc' => '12 قطعة كب كيك بنكهات متنوعة تشمل فانيليا وشوكولاتة وريد فلفت وكراميل مملح.',
                        'how_to_use' => "يُقدم بدرجة حرارة الغرفة. أخرجها من التغليف 15 دقيقة قبل التقديم. يمكن حفظها بالثلاجة حتى 3 أيام.",
                        'ingredients' => 'طحين، سكر، بيض، زبدة، جبنة كريمية، كاكاو، فانيليا، لون طعام طبيعي، كراميل، ملح بحري',
                        'benefits' => "• 4 نكهات فريدة في كل صندوق\n• مخبوزة طازجة بزبدة فاخرة\n• ألوان طعام طبيعية\n• مثالية للحفلات والمناسبات\n• تغليف عرض جميل",
                    ],
                ],
            ],
            'balloon-world' => [
                [
                    'sub' => 'balloon-bouquets',
                    'slug' => 'helium-balloon-bouquet',
                    'price' => 150.00,
                    'img' => '/images/products/balloon-bouquet.jpg',
                    'brand' => 'Balloon World',
                    'size' => '7 Balloons',
                    'country_of_origin' => 'Saudi Arabia',
                    'en' => [
                        'name' => 'Helium Balloon Bouquet',
                        'desc' => 'A cheerful bouquet of 7 premium latex and foil helium balloons in your choice of color scheme. Perfect for birthdays, graduations, and celebrations.',
                        'how_to_use' => "1. Balloons arrive pre-inflated and ready to display\n2. Tie the weighted ribbon to any surface\n3. Keep away from sharp objects, heat, and direct sunlight\n4. Helium balloons float for 12-24 hours (latex) or 3-5 days (foil)",
                        'ingredients' => '5 Premium latex balloons (biodegradable), 2 Foil character balloons, Helium gas fill, Curling ribbon, Balloon weight',
                        'benefits' => "• Biodegradable latex balloons\n• Pre-inflated and delivered ready\n• Custom color scheme available\n• Includes decorative weight\n• Same-day delivery available",
                    ],
                    'ar' => [
                        'name' => 'باقة بالون هيليوم',
                        'desc' => 'باقة مبهجة من 7 بالونات هيليوم فاخرة لاتكس وفويل بألوان من اختيارك.',
                        'how_to_use' => "1. تصل البالونات منفوخة وجاهزة للعرض\n2. اربط الشريط في أي سطح\n3. أبعدها عن الأشياء الحادة والحرارة\n4. بالونات اللاتكس تطفو 12-24 ساعة والفويل 3-5 أيام",
                        'ingredients' => '5 بالونات لاتكس قابلة للتحلل، 2 بالون فويل، غاز هيليوم، شريط، ثقل بالون',
                        'benefits' => "• بالونات لاتكس قابلة للتحلل\n• منفوخة وجاهزة للتسليم\n• ألوان مخصصة متاحة\n• ثقل مزخرف مرفق\n• توصيل في نفس اليوم",
                    ],
                ],
                [
                    'sub' => 'balloon-decorations',
                    'slug' => 'birthday-balloon-arch',
                    'price' => 450.00,
                    'img' => '/images/products/balloon-arch.jpg',
                    'brand' => 'Balloon World',
                    'size' => '3 meters wide',
                    'country_of_origin' => 'Saudi Arabia',
                    'en' => [
                        'name' => 'Birthday Balloon Arch',
                        'desc' => 'A stunning 3-meter balloon arch in your chosen color palette. Professional installation included. Perfect backdrop for photos and events.',
                        'how_to_use' => "Our team will install the arch at your location. Installation takes approximately 45-60 minutes. Please ensure clear access to the installation area. Arch can be set up indoors or in covered outdoor areas.",
                        'ingredients' => '150+ Premium latex balloons (various sizes), Balloon arch frame (reusable), Decorative greenery and ribbons, Balloon adhesive strips',
                        'benefits' => "• Professional installation included\n• Custom color palette to match your theme\n• 150+ balloons for dramatic impact\n• Photo-ready instant backdrop\n• Setup and takedown included",
                    ],
                    'ar' => [
                        'name' => 'قوس بالون لعيد الميلاد',
                        'desc' => 'قوس بالون مذهل بطول 3 أمتار بألوان من اختيارك. التركيب الاحترافي مشمول.',
                        'how_to_use' => "فريقنا سيقوم بتركيب القوس في موقعك. التركيب يستغرق 45-60 دقيقة. يرجى توفير وصول واضح لمنطقة التركيب.",
                        'ingredients' => '150+ بالون لاتكس فاخر، هيكل قوس (قابل لإعادة الاستخدام)، ديكور أخضر وأشرطة، لاصق بالون',
                        'benefits' => "• تركيب احترافي مشمول\n• ألوان مخصصة لمطابقة موضوعك\n• أكثر من 150 بالون\n• خلفية جاهزة للتصوير\n• التركيب والإزالة مشمولان",
                    ],
                ],
            ],
            'candle-craft' => [
                [
                    'sub' => 'candles',
                    'slug' => 'scented-soy-candle',
                    'price' => 95.00,
                    'img' => '/images/products/soy-candle.jpg',
                    'brand' => 'Yankee Candle',
                    'size' => '200g (40 hour burn)',
                    'country_of_origin' => 'USA',
                    'en' => [
                        'name' => 'Scented Soy Candle',
                        'desc' => 'Hand-poured natural soy wax candle with essential oil blend of lavender and vanilla. Clean burn with cotton wick in a reusable ceramic jar.',
                        'how_to_use' => "1. Trim wick to 5mm before each lighting\n2. Allow wax to melt to the edges on first burn (2-3 hours)\n3. Do not burn for more than 4 hours at a time\n4. Keep away from drafts and flammable materials\n5. Never leave unattended\n6. Stop use when 1cm of wax remains",
                        'ingredients' => '100% Natural soy wax, Cotton wick, Essential oils (Lavender, Vanilla), Reusable ceramic jar with wooden lid',
                        'benefits' => "• 100% natural soy wax — no paraffin\n• Clean, soot-free burn\n• 40-hour total burn time\n• Reusable handmade ceramic jar\n• Therapeutic essential oil blend\n• Eco-friendly & biodegradable",
                    ],
                    'ar' => [
                        'name' => 'شمعة صويا معطرة',
                        'desc' => 'شمعة شمع صويا طبيعية مصبوبة يدوياً بزيوت عطرية من اللافندر والفانيليا.',
                        'how_to_use' => "1. قص الفتيل إلى 5 مم قبل كل إشعال\n2. اترك الشمع يذوب حتى الحواف في أول حرق\n3. لا تحرقها أكثر من 4 ساعات\n4. أبعدها عن التيارات الهوائية\n5. لا تتركها بدون مراقبة\n6. توقف عن الاستخدام عند بقاء 1 سم",
                        'ingredients' => 'شمع صويا طبيعي 100%، فتيل قطني، زيوت عطرية (لافندر، فانيليا)، جرة سيراميك قابلة لإعادة الاستخدام',
                        'benefits' => "• شمع صويا طبيعي 100%\n• حرق نظيف بدون سخام\n• 40 ساعة حرق إجمالية\n• جرة سيراميك يدوية قابلة لإعادة الاستخدام\n• مزيج زيوت عطرية\n• صديقة للبيئة",
                    ],
                ],
                [
                    'sub' => 'candles',
                    'slug' => 'luxury-beeswax-candle',
                    'price' => 180.00,
                    'img' => '/images/products/beeswax-candle.jpg',
                    'brand' => 'Candle Craft',
                    'size' => '350g (60 hour burn)',
                    'country_of_origin' => 'New Zealand',
                    'en' => [
                        'name' => 'Luxury Beeswax Candle',
                        'desc' => 'Premium all-natural beeswax candle with a warm honey scent. Hand-poured in small batches with cotton wick. Purifies air naturally while burning.',
                        'how_to_use' => "1. Place candle on a heat-resistant surface\n2. Trim wick to 6mm before lighting\n3. Burn for 2-4 hours per session\n4. Beeswax candles improve with each burn\n5. Store in a cool, dark place when not in use",
                        'ingredients' => '100% Pure New Zealand beeswax, Braided cotton wick, Natural honey fragrance, Hand-blown glass vessel',
                        'benefits' => "• Air-purifying negative ions while burning\n• Natural warm honey scent (no artificial fragrance)\n• 60-hour burn time\n• Hypoallergenic\n• Handmade in small batches\n• Premium glass vessel included",
                    ],
                    'ar' => [
                        'name' => 'شمعة عسل فاخرة',
                        'desc' => 'شمعة شمع عسل طبيعي فاخرة برائحة عسل دافئة. مصبوبة يدوياً بدفعات صغيرة.',
                        'how_to_use' => "1. ضع الشمعة على سطح مقاوم للحرارة\n2. قص الفتيل إلى 6 مم\n3. أحرقها 2-4 ساعات في كل مرة\n4. شموع العسل تتحسن مع كل حرق\n5. خزنها في مكان بارد ومظلم",
                        'ingredients' => 'شمع عسل نيوزيلندي نقي 100%، فتيل قطني مضفر، رائحة عسل طبيعية، وعاء زجاجي يدوي الصنع',
                        'benefits' => "• تنقية الهواء بأيونات سالبة\n• رائحة عسل طبيعية\n• 60 ساعة حرق\n• مضادة للحساسية\n• مصنوعة يدوياً بدفعات صغيرة\n• وعاء زجاجي فاخر مرفق",
                    ],
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
                DB::table('products')->updateOrInsert(
                    ['tenant_id' => $tenant->id, 'slug' => $p['slug']],
                    [
                        'subcategory_id' => $subId,
                        'price' => $p['price'],
                        'stock_quantity' => rand(10, 100),
                        'image_url' => $p['img'],
                        'status' => 'active',
                        'brand' => $p['brand'] ?? null,
                        'size' => $p['size'] ?? null,
                        'country_of_origin' => $p['country_of_origin'] ?? null,
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
                            'how_to_use' => $p['en']['how_to_use'] ?? null,
                            'ingredients' => $p['en']['ingredients'] ?? null,
                            'benefits' => $p['en']['benefits'] ?? null,
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
                            'how_to_use' => $p['ar']['how_to_use'] ?? null,
                            'ingredients' => $p['ar']['ingredients'] ?? null,
                            'benefits' => $p['ar']['benefits'] ?? null,
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