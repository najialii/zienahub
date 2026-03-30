<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get an existing tenant or create a default one immediately
        // This ensures the foreign key check never fails.
        $tenantId = DB::table('tenants')->value('id') ?? DB::table('tenants')->insertGetId([
            'name' => 'Bloomcart Store',
            'slug' => 'bloomcart',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $users = [
            // Admin users
            [
                'name' => 'Admin User',
                'email' => 'admin@bloomcart.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
                'locale' => 'en',
                'created_at' => Carbon::now()->subMonths(12),
                'updated_at' => Carbon::now()->subMonths(12),
            ],
            [
                'name' => 'مدير النظام',
                'email' => 'admin.ar@bloomcart.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
                'locale' => 'ar',
                'created_at' => Carbon::now()->subMonths(12),
                'updated_at' => Carbon::now()->subMonths(12),
            ],
            // ... [Keep all your other user arrays here]
            [
                'name' => 'Inactive User',
                'email' => 'inactive@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'inactive',
                'locale' => 'en',
                'created_at' => Carbon::now()->subMonths(9),
                'updated_at' => Carbon::now()->subMonths(9),
            ],
        ];

        // 2. Map through the array and attach the tenantId to every record
        $finalUsers = array_map(function ($user) use ($tenantId) {
            $user['tenant_id'] = $tenantId;
            return $user;
        }, $users);

        // 3. Insert the modified array
        DB::table('users')->insert($finalUsers);
    }
}