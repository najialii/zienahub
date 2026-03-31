<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $mainTenant = Tenant::firstOrCreate(
            ['slug' => 'bloomcart'],
            [
                'name' => 'Bloomcart Store',
                'subscription_plan' => 'pro',
                'subscription_status' => 'active',
                'monthly_price' => 299,
                'max_users' => 20,
                'max_products' => 5000,
                'subscription_starts_at' => now()->subMonths(1),
                'subscription_ends_at' => now()->addMonths(11),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $giftTenant = Tenant::firstOrCreate(
            ['slug' => 'gift-hub'],
            [
                'name' => 'Gift Hub',
                'subscription_plan' => 'starter',
                'subscription_status' => 'trial',
                'monthly_price' => 99,
                'max_users' => 5,
                'max_products' => 1000,
                'subscription_starts_at' => now()->subDays(3),
                'subscription_ends_at' => now()->addDays(11),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $users = [
            [
                'name' => 'Bloomcart Admin',
                'email' => 'admin@bloomcart.com',
                'password' => 'password',
                'role' => 'tenant_admin',
                'status' => 'active',
                'locale' => 'en',
                'tenant_id' => $mainTenant->id,
                'created_at' => Carbon::now()->subMonths(12),
                'updated_at' => Carbon::now()->subMonths(12),
            ],
            [
                'name' => 'Gift Hub Admin',
                'email' => 'admin@gifthub.com',
                'password' => 'password',
                'role' => 'tenant_admin',
                'status' => 'active',
                'locale' => 'en',
                'tenant_id' => $giftTenant->id,
                'created_at' => Carbon::now()->subMonths(10),
                'updated_at' => Carbon::now()->subMonths(10),
            ],
            [
                'name' => 'Bloomcart Customer',
                'email' => 'user@bloomcart.com',
                'password' => 'password',
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'en',
                'tenant_id' => $mainTenant->id,
                'created_at' => Carbon::now()->subMonths(8),
                'updated_at' => Carbon::now()->subMonths(8),
            ],
            [
                'name' => 'Inactive User',
                'email' => 'inactive@example.com',
                'password' => 'password',
                'role' => 'customer',
                'status' => 'inactive',
                'locale' => 'en',
                'tenant_id' => $mainTenant->id,
                'created_at' => Carbon::now()->subMonths(9),
                'updated_at' => Carbon::now()->subMonths(9),
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                    'role' => $userData['role'],
                    'status' => $userData['status'],
                    'locale' => $userData['locale'],
                    'tenant_id' => $userData['tenant_id'],
                    'created_at' => $userData['created_at'],
                    'updated_at' => $userData['updated_at'],
                ]
            );
        }
    }
}