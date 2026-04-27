<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PricingTier;
use Illuminate\Http\Request;

class PricingTierController extends Controller
{
    public function index()
    {
        $tiers = PricingTier::withCount('tenants')->orderBy('monthly_fee')->get();

        return response()->json([
            'success' => true,
            'data' => $tiers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'monthly_fee' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $tier = PricingTier::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pricing tier created successfully',
            'data' => $tier,
        ], 201);
    }

    public function update(Request $request, PricingTier $pricingTier)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'monthly_fee' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $pricingTier->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pricing tier updated successfully',
            'data' => $pricingTier->fresh(),
        ]);
    }

    public function destroy(PricingTier $pricingTier)
    {
        // Check if any tenants are using this tier
        if ($pricingTier->tenants()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete tier that is assigned to tenants',
            ], 422);
        }

        $pricingTier->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pricing tier deleted successfully',
        ]);
    }
}
