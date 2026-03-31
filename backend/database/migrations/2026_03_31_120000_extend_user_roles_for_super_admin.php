<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('customer','tenant_admin','super_admin','admin') NOT NULL DEFAULT 'customer'");
        DB::statement("UPDATE users SET role = 'tenant_admin' WHERE role = 'admin'");
    }

    public function down(): void
    {
        DB::statement("UPDATE users SET role = 'admin' WHERE role = 'tenant_admin'");
        DB::statement("UPDATE users SET role = 'customer' WHERE role = 'super_admin'");
        DB::statement("ALTER TABLE users MODIFY role ENUM('customer','admin') NOT NULL DEFAULT 'customer'");
    }
};
