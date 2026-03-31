<?php

namespace Database\Seeders;

use App\Models\Tenant;
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
        $mainTenant = Tenant::firstOrCreate(
            ['slug' => 'bloomcart'],
            ['name' => 'Bloomcart Store']
        );

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

        User::updateOrCreate(
            ['email' => 'tenant.admin@email.com'],
            [
                'name' => 'Default Tenant Admin',
                'password' => Hash::make('11235813nj'),
                'role' => 'tenant_admin',
                'tenant_id' => $mainTenant->id,
                'status' => 'active',
                'locale' => 'en',
            ]
        );
    }
}
