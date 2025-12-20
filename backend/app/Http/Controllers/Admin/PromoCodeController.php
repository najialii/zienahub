<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PromoCodeController extends Controller
{
    /**
     * Display a listing of promo codes.
     */
    public function index(Request $request)
    {
        $query = PromoCode::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'expired') {
                $query->where('expires_at', '<', now());
            }
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $promoCodes = $query->withCount('usages')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $promoCodes
        ]);
    }

    /**
     * Store a newly created promo code.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:promo_codes,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'minimum_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_limit_per_user' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
            'auto_apply' => 'boolean',
            'applicable_products' => 'nullable|array',
            'applicable_categories' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Auto-generate code if not provided
        if (!$request->code) {
            $request->merge(['code' => $this->generatePromoCode()]);
        }

        $promoCode = PromoCode::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Promo code created successfully',
            'data' => $promoCode
        ], 201);
    }

    /**
     * Display the specified promo code.
     */
    public function show(PromoCode $promoCode)
    {
        $promoCode->load(['usages.order', 'usages.user']);
        $promoCode->loadCount('usages');

        return response()->json([
            'success' => true,
            'data' => $promoCode
        ]);
    }

    /**
     * Update the specified promo code.
     */
    public function update(Request $request, PromoCode $promoCode)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:promo_codes,code,' . $promoCode->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'minimum_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_limit_per_user' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
            'auto_apply' => 'boolean',
            'applicable_products' => 'nullable|array',
            'applicable_categories' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $promoCode->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Promo code updated successfully',
            'data' => $promoCode
        ]);
    }

    /**
     * Remove the specified promo code.
     */
    public function destroy(PromoCode $promoCode)
    {
        // Check if promo code has been used
        if ($promoCode->usage_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete promo code that has been used'
            ], 400);
        }

        $promoCode->delete();

        return response()->json([
            'success' => true,
            'message' => 'Promo code deleted successfully'
        ]);
    }

    /**
     * Generate a random promo code.
     */
    public function generateCode()
    {
        $code = $this->generatePromoCode();

        return response()->json([
            'success' => true,
            'code' => $code
        ]);
    }

    /**
     * Get promo code statistics.
     */
    public function getStats()
    {
        $stats = [
            'total_codes' => PromoCode::count(),
            'active_codes' => PromoCode::where('is_active', true)->count(),
            'expired_codes' => PromoCode::where('expires_at', '<', now())->count(),
            'auto_apply_codes' => PromoCode::where('auto_apply', true)->count(),
            'total_usage' => PromoCode::sum('usage_count'),
            'total_discount_given' => \DB::table('promo_code_usages')->sum('discount_amount')
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Toggle promo code status.
     */
    public function toggleStatus(PromoCode $promoCode)
    {
        $promoCode->update(['is_active' => !$promoCode->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Promo code status updated',
            'data' => $promoCode
        ]);
    }

    /**
     * Generate a unique promo code.
     */
    private function generatePromoCode()
    {
        do {
            $code = 'PROMO' . Str::upper(Str::random(6));
        } while (PromoCode::where('code', $code)->exists());

        return $code;
    }
}