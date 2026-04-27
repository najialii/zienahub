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
        $monthlyRecurringRevenue = Tenant::with('pricingTier')
            ->where('subscription_status', 'active')
            ->get()
            ->sum(function ($tenant) {
                return $tenant->effective_monthly_fee;
            });
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

    public function show(Tenant $tenant)
    {
        $tenant->loadCount(['users', 'products']);
        $tenant->load([
            'users' => fn($q) => $q->select('id','name','email','phone','role','status','created_at','tenant_id'),
            'pricingTier',
        ]);

        // Load products with English translation
        $products = \DB::table('products')
            ->leftJoin('product_translations', function($join) {
                $join->on('product_translations.product_id', '=', 'products.id')
                     ->where('product_translations.locale', '=', 'en');
            })
            ->where('products.tenant_id', $tenant->id)
            ->select(
                'products.id',
                'products.slug',
                'products.price',
                'products.stock_quantity',
                'products.status',
                'products.image_url',
                'products.created_at',
                'product_translations.name'
            )
            ->orderBy('products.created_at', 'desc')
            ->limit(50)
            ->get();

        $data = $tenant->toArray();
        $data['products'] = $products;

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    public function index()
    {
        $tenants = Tenant::with('pricingTier')->withCount([
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
            'name'                  => 'required|string|max:255',
            'slug'                  => 'nullable|string|max:255|unique:tenants,slug',
            'admin_name'            => 'required|string|max:255',
            'admin_email'           => 'required|email|max:255|unique:users,email',
            'admin_phone'           => 'nullable|string|max:20|unique:users,phone',
            'admin_password'        => 'required|string|min:8',
            'subscription_status'   => 'nullable|in:trial,active,past_due,cancelled',
            'pricing_tier_id'       => 'nullable|exists:pricing_tiers,id',
            'monthly_fee'           => 'nullable|numeric|min:0',
            'max_users'             => 'nullable|integer|min:1',
            'max_products'          => 'nullable|integer|min:1',
            'subscription_starts_at'=> 'nullable|date',
            'subscription_ends_at'  => 'nullable|date|after_or_equal:subscription_starts_at',
            'is_active'             => 'nullable|boolean',
        ]);

        $tenant = Tenant::create([
            'name'                  => $validated['name'],
            'slug'                  => $validated['slug'] ?: Str::slug($validated['name']) . '-' . Str::lower(Str::random(4)),
            'subscription_status'   => $validated['subscription_status'] ?? 'trial',
            'pricing_tier_id'       => $validated['pricing_tier_id'] ?? null,
            'monthly_fee'           => $validated['monthly_fee'] ?? 0,
            'max_users'             => $validated['max_users'] ?? 5,
            'max_products'          => $validated['max_products'] ?? 500,
            'subscription_starts_at'=> $validated['subscription_starts_at'] ?? now(),
            'subscription_ends_at'  => $validated['subscription_ends_at'] ?? now()->addDays(14),
            'is_active'             => $validated['is_active'] ?? true,
            'verification_status'   => 'approved', // super admin creates = auto approved
        ]);

        $admin = User::create([
            'name'        => $validated['admin_name'],
            'email'       => $validated['admin_email'],
            'phone'       => $validated['admin_phone'] ?? null,
            'password'    => Hash::make($validated['admin_password']),
            'role'        => 'tenant_admin',
            'account_type'=> 'seller',
            'profile_completed' => true,
            'tenant_id'   => $tenant->id,
            'status'      => 'active',
            'locale'      => 'en',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tenant created successfully',
            'data' => [
                'tenant' => $tenant,
                'admin'  => [
                    'id'        => $admin->id,
                    'name'      => $admin->name,
                    'email'     => $admin->email,
                    'phone'     => $admin->phone,
                    'role'      => $admin->role,
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

    public function approveTenant(Tenant $tenant)
    {
        $tenant->update([
            'verification_status' => 'approved',
            'is_active'           => true,
            'rejection_reason'    => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tenant approved successfully',
            'data'    => $tenant->fresh(),
        ]);
    }

    public function rejectTenant(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $tenant->update([
            'verification_status' => 'rejected',
            'is_active'           => false,
            'rejection_reason'    => $validated['rejection_reason'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tenant rejected',
            'data'    => $tenant->fresh(),
        ]);
    }

    public function updateSubscription(Request $request, Tenant $tenant)    {
        $validated = $request->validate([
            'subscription_status' => 'sometimes|in:trial,active,past_due,cancelled',
            'pricing_tier_id' => 'nullable|exists:pricing_tiers,id',
            'monthly_fee' => 'sometimes|numeric|min:0',
            'max_users' => 'sometimes|integer|min:1',
            'max_products' => 'sometimes|integer|min:1',
            'subscription_starts_at' => 'nullable|date',
            'subscription_ends_at' => 'nullable|date|after_or_equal:subscription_starts_at',
            'is_active' => 'sometimes|boolean',
        ]);

        // If pricing_tier_id is being set, clear custom monthly_fee
        if (isset($validated['pricing_tier_id']) && $validated['pricing_tier_id']) {
            $validated['monthly_fee'] = 0;
        }

        $tenant->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Subscription updated successfully',
            'data' => $tenant->fresh()->load('pricingTier'),
        ]);
    }
}
