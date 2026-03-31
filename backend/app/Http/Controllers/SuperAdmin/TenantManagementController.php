<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TenantManagementController extends Controller
{
    public function dashboard()
    {
        $now = Carbon::now();
        $nextWeek = $now->copy()->addDays(7);

        $totalTenants = Tenant::count();
        $activeSubscriptions = Tenant::where('subscription_status', 'active')
            ->where(function ($query) use ($now) {
                $query->whereNull('subscription_ends_at')
                    ->orWhere('subscription_ends_at', '>=', $now);
            })
            ->count();
        $expiringSoon = Tenant::whereNotNull('subscription_ends_at')
            ->whereBetween('subscription_ends_at', [$now, $nextWeek])
            ->count();
        $monthlyRecurringRevenue = (float) Tenant::where('subscription_status', 'active')->sum('monthly_price');
        $tenantAdmins = User::whereIn('role', ['tenant_admin', 'admin'])->count();
        $superAdmins = User::where('role', 'super_admin')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_tenants' => $totalTenants,
                'active_subscriptions' => $activeSubscriptions,
                'expiring_soon' => $expiringSoon,
                'monthly_recurring_revenue' => $monthlyRecurringRevenue,
                'tenant_admins' => $tenantAdmins,
                'super_admins' => $superAdmins,
            ],
        ]);
    }

    public function index()
    {
        $tenants = Tenant::withCount([
            'users',
            'users as tenant_admins_count' => function ($query) {
                $query->whereIn('role', ['tenant_admin', 'admin']);
            },
        ])->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $tenants,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:tenants,slug',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255|unique:users,email',
            'admin_password' => 'required|string|min:8',
            'subscription_plan' => 'nullable|string|max:100',
            'subscription_status' => 'nullable|in:trial,active,past_due,cancelled',
            'monthly_price' => 'nullable|numeric|min:0',
            'max_users' => 'nullable|integer|min:1',
            'max_products' => 'nullable|integer|min:1',
            'subscription_starts_at' => 'nullable|date',
            'subscription_ends_at' => 'nullable|date|after_or_equal:subscription_starts_at',
            'is_active' => 'nullable|boolean',
        ]);

        $tenant = Tenant::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?: Str::slug($validated['name']) . '-' . Str::lower(Str::random(4)),
            'subscription_plan' => $validated['subscription_plan'] ?? 'starter',
            'subscription_status' => $validated['subscription_status'] ?? 'trial',
            'monthly_price' => $validated['monthly_price'] ?? 0,
            'max_users' => $validated['max_users'] ?? 5,
            'max_products' => $validated['max_products'] ?? 500,
            'subscription_starts_at' => $validated['subscription_starts_at'] ?? now(),
            'subscription_ends_at' => $validated['subscription_ends_at'] ?? now()->addDays(14),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $admin = User::create([
            'name' => $validated['admin_name'],
            'email' => $validated['admin_email'],
            'password' => Hash::make($validated['admin_password']),
            'role' => 'tenant_admin',
            'tenant_id' => $tenant->id,
            'status' => 'active',
            'locale' => 'en',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tenant created successfully',
            'data' => [
                'tenant' => $tenant,
                'admin' => [
                    'id' => $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'role' => $admin->role,
                    'tenant_id' => $admin->tenant_id,
                ],
            ],
        ], 201);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('tenants', 'slug')->ignore($tenant->id),
            ],
            'is_active' => 'sometimes|boolean',
        ]);

        $tenant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tenant updated successfully',
            'data' => $tenant,
        ]);
    }

    public function destroy(Tenant $tenant)
    {
        User::where('tenant_id', $tenant->id)->whereIn('role', ['tenant_admin', 'admin'])->delete();
        $tenant->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tenant deleted successfully',
        ]);
    }

    public function updateSubscription(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'subscription_plan' => 'sometimes|string|max:100',
            'subscription_status' => 'sometimes|in:trial,active,past_due,cancelled',
            'monthly_price' => 'sometimes|numeric|min:0',
            'max_users' => 'sometimes|integer|min:1',
            'max_products' => 'sometimes|integer|min:1',
            'subscription_starts_at' => 'nullable|date',
            'subscription_ends_at' => 'nullable|date|after_or_equal:subscription_starts_at',
            'is_active' => 'sometimes|boolean',
        ]);

        $tenant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Subscription updated successfully',
            'data' => $tenant->fresh(),
        ]);
    }
}
