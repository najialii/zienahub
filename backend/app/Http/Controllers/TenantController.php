<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    /**
     * Home Page / Discovery
     */
    public function index(Request $request)
    {
        $tenants = Tenant::query()
            ->when($request->boolean('featured'), function ($q) {
                return $q->where('featured', true);
            })
            // ->whereNotNull('logo')
            ->latest()
            ->paginate(12);

        return response()->json($tenants);
    }

    /**
     * Storefront Detail
     */
    public function show($idOrSlug)
    {
        $tenant = Tenant::query()
            ->where(function ($q) use ($idOrSlug) {
                $q->where('id', $idOrSlug)
                  ->orWhere('slug', $idOrSlug);
            })
            ->withCount('products')
            ->firstOrFail();

        return response()->json($tenant);
    }

    /**
     * Administrative List
     */
    public function adminIndex()
    {
        // Simple and complete list for your dashboard
        return response()->json(Tenant::latest()->get());
    }

    public function products(Tenant $tenant)
    {
        // Paginate products for the specific shop page
        return response()->json($tenant->products()->latest()->paginate(20));
    }
}