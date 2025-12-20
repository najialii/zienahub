<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@email.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('11235813nj'),
                'role' => 'admin',
            ]
        );

        // Create test customer user
        User::updateOrCreate(
            ['email' => 'user@email.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('11235813nj'),
                'role' => 'customer',
            ]
        );

        $this->command->info('Admin and test users created successfully!');
    }
}
