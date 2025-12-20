<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\PromoCode;

echo "Creating Sample Promo Codes\n";
echo "===========================\n\n";

$promoCodes = [
    [
        'code' => 'WELCOME10',
        'name' => 'Welcome Discount',
        'description' => 'Welcome new customers with 10% off',
        'type' => 'percentage',
        'value' => 10,
        'minimum_amount' => 50,
        'maximum_discount' => 100,
        'usage_limit' => 100,
        'usage_limit_per_user' => 1,
        'is_active' => true,
        'auto_apply' => false,
        'expires_at' => now()->addDays(30)
    ],
    [
        'code' => 'SAVE50',
        'name' => 'Fixed 50 SAR Off',
        'description' => 'Get 50 SAR off on orders above 200 SAR',
        'type' => 'fixed',
        'value' => 50,
        'minimum_amount' => 200,
        'usage_limit' => 50,
        'is_active' => true,
        'auto_apply' => false,
        'expires_at' => now()->addDays(15)
    ],
    [
        'code' => 'FREESHIP',
        'name' => 'Free Shipping',
        'description' => 'Free shipping on all orders',
        'type' => 'fixed',
        'value' => 25, // Assuming shipping cost is 25 SAR
        'minimum_amount' => 100,
        'usage_limit' => null, // Unlimited
        'is_active' => true,
        'auto_apply' => false,
        'expires_at' => now()->addDays(60)
    ],
    [
        'code' => 'AUTO15',
        'name' => 'Auto Apply 15%',
        'description' => 'Automatically applied 15% discount',
        'type' => 'percentage',
        'value' => 15,
        'minimum_amount' => 300,
        'maximum_discount' => 150,
        'is_active' => true,
        'auto_apply' => true, // This will be automatically applied
        'expires_at' => now()->addDays(45)
    ],
    [
        'code' => 'BIGORDER',
        'name' => 'Big Order Discount',
        'description' => '20% off on orders above 500 SAR',
        'type' => 'percentage',
        'value' => 20,
        'minimum_amount' => 500,
        'maximum_discount' => 200,
        'usage_limit' => 25,
        'is_active' => true,
        'auto_apply' => false,
        'expires_at' => now()->addDays(20)
    ]
];

foreach ($promoCodes as $promoData) {
    try {
        $promo = PromoCode::create($promoData);
        echo "✅ Created: {$promo->code} - {$promo->name}\n";
        echo "   Type: {$promo->type}, Value: {$promo->value}" . ($promo->type === 'percentage' ? '%' : ' SAR') . "\n";
        echo "   Auto Apply: " . ($promo->auto_apply ? 'Yes' : 'No') . "\n";
        echo "   Expires: " . ($promo->expires_at ? $promo->expires_at->format('Y-m-d') : 'Never') . "\n\n";
    } catch (\Exception $e) {
        echo "❌ Failed to create {$promoData['code']}: " . $e->getMessage() . "\n\n";
    }
}

echo "🎯 Sample promo codes created successfully!\n";
echo "\nYou can now:\n";
echo "1. View them in admin panel: /admin/promo-codes\n";
echo "2. Test them in checkout with codes: WELCOME10, SAVE50, FREESHIP, BIGORDER\n";
echo "3. AUTO15 will be automatically applied for orders above 300 SAR\n";