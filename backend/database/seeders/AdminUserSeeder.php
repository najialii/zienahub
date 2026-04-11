<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@email.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('11235813nj'),
                'role' => 'super_admin',
                'tenant_id' => null,
                'status' => 'active',
                'locale' => 'en',
            ]
        );

        // 2. Create 10 Tenants and an Admin for each
        $tenantData = [
            ['name' => 'Bloomcart Store', 'slug' => 'bloomcart'],
            ['name' => 'Tech Haven', 'slug' => 'tech-haven'],
            ['name' => 'Cairo Fashion', 'slug' => 'cairo-fashion'],
            ['name' => 'Urban Eats', 'slug' => 'urban-eats'],
            ['name' => 'Giza Gadgets', 'slug' => 'giza-gadgets'],
            ['name' => 'Nile Boutique', 'slug' => 'nile-boutique'],
            ['name' => 'Desert Rose', 'slug' => 'desert-rose'],
            ['name' => 'Pyramid Books', 'slug' => 'pyramid-books'],
            ['name' => 'Sphinx Sports', 'slug' => 'sphinx-sports'],
            ['name' => 'Alexandria Arts', 'slug' => 'alexandria-arts'],
        ];

        foreach ($tenantData as $index => $data) {
            // Create or update the Tenant
            $tenant = Tenant::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'address' => 'Street ' . ($index + 1) . ', Cairo, Egypt',
                    'phone_number' => '010' . rand(10000000, 99999999),
                    'featured' => true,
                    // Note: Ensure these images actually exist in your storage or use a placeholder
                    'cover_image' => "/storage/images/covers/{$data['slug']}-cover.jpg",
                ]
            );

            // Create a dedicated Admin for this specific Tenant
            User::updateOrCreate(
                ['email' => "admin@{$data['slug']}.com"],
                [
                    'name' => "{$data['name']} Admin",
                    'password' => Hash::make('11235813nj'),
                    'role' => 'tenant_admin',
                    'tenant_id' => $tenant->id,
                    'status' => 'active',
                    'locale' => 'en',
                ]
            );
        }
    }
}