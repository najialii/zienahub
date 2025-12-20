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
            // Customer users with varied creation dates
            [
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'en',
                'created_at' => Carbon::now()->subMonths(10),
                'updated_at' => Carbon::now()->subMonths(10),
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.j@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'en',
                'created_at' => Carbon::now()->subMonths(8),
                'updated_at' => Carbon::now()->subMonths(8),
            ],
            [
                'name' => 'Michael Chen',
                'email' => 'michael.chen@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'en',
                'created_at' => Carbon::now()->subMonths(6),
                'updated_at' => Carbon::now()->subMonths(6),
            ],
            [
                'name' => 'Emily Davis',
                'email' => 'emily.davis@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'en',
                'created_at' => Carbon::now()->subMonths(5),
                'updated_at' => Carbon::now()->subMonths(5),
            ],
            [
                'name' => 'David Wilson',
                'email' => 'david.w@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'en',
                'created_at' => Carbon::now()->subMonths(4),
                'updated_at' => Carbon::now()->subMonths(4),
            ],
            [
                'name' => 'أحمد محمد',
                'email' => 'ahmed.m@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'ar',
                'created_at' => Carbon::now()->subMonths(7),
                'updated_at' => Carbon::now()->subMonths(7),
            ],
            [
                'name' => 'فاطمة علي',
                'email' => 'fatima.a@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'ar',
                'created_at' => Carbon::now()->subMonths(3),
                'updated_at' => Carbon::now()->subMonths(3),
            ],
            [
                'name' => 'محمود حسن',
                'email' => 'mahmoud.h@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'ar',
                'created_at' => Carbon::now()->subMonths(2),
                'updated_at' => Carbon::now()->subMonths(2),
            ],
            [
                'name' => 'ليلى خالد',
                'email' => 'layla.k@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'ar',
                'created_at' => Carbon::now()->subMonth(),
                'updated_at' => Carbon::now()->subMonth(),
            ],
            [
                'name' => 'Jessica Martinez',
                'email' => 'jessica.m@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'en',
                'created_at' => Carbon::now()->subWeeks(3),
                'updated_at' => Carbon::now()->subWeeks(3),
            ],
            [
                'name' => 'Robert Taylor',
                'email' => 'robert.t@example.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'status' => 'active',
                'locale' => 'en',
                'created_at' => Carbon::now()->subWeeks(2),
                'updated_at' => Carbon::now()->subWeeks(2),
            ],
            // One inactive customer for testing
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

        DB::table('users')->insert($users);
    }
}
