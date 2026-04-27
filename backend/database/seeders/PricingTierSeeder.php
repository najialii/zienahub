<?php

namespace Database\Seeders;

use App\Models\PricingTier;
use Illuminate\Database\Seeder;

class PricingTierSeeder extends Seeder
{
    public function run(): void
    {
        $tiers = [
            [
                'name' => 'Starter',
                'monthly_fee' => 29.99,
                'description' => 'Perfect for small businesses just getting started',
                'is_active' => true,
            ],
            [
                'name' => 'Professional',
                'monthly_fee' => 79.99,
                'description' => 'For growing businesses with more products and users',
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'monthly_fee' => 199.99,
                'description' => 'Full-featured plan for large operations',
                'is_active' => true,
            ],
            [
                'name' => 'Free Trial',
                'monthly_fee' => 0.00,
                'description' => 'Free trial period for new vendors',
                'is_active' => true,
            ],
        ];

        foreach ($tiers as $tier) {
            PricingTier::firstOrCreate(
                ['name' => $tier['name']],
                $tier
            );
        }
    }
}
