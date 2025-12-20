<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PromoCodeController extends Controller
{
    /**
     * Validate and apply promo code.
     */
    public function validateCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
            'items' => 'nullable|array',
            'user_id' => 'nullable|integer',
            'user_email' => 'nullable|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $promoCode = PromoCode::where('code', strtoupper($request->code))->first();

        if (!$promoCode) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid promo code'
            ], 404);
        }

        if (!$promoCode->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Promo code is not valid or has expired'
            ], 400);
        }

        if (!$promoCode->canBeUsedBy($request->user_id, $request->user_email)) {
            return response()->json([
                'success' => false,
                'message' => 'You have already used this promo code'
            ], 400);
        }

        $discount = $promoCode->calculateDiscount($request->subtotal, $request->items ?? []);

        if ($discount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Promo code is not applicable to your order'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Promo code applied successfully',
            'data' => [
                'promo_code' => $promoCode->only(['id', 'code', 'name', 'type', 'value']),
                'discount_amount' => $discount,
                'new_total' => max(0, $request->subtotal - $discount)
            ]
        ]);
    }

    /**
     * Get auto-apply promo codes for checkout.
     */
    public function getAutoApply(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subtotal' => 'required|numeric|min:0',
            'items' => 'nullable|array',
            'user_id' => 'nullable|integer',
            'user_email' => 'nullable|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $autoApplyCodes = PromoCode::valid()
            ->autoApply()
            ->orderBy('value', 'desc') // Apply highest discount first
            ->get();

        $bestDiscount = 0;
        $bestPromoCode = null;

        foreach ($autoApplyCodes as $promoCode) {
            if ($promoCode->canBeUsedBy($request->user_id, $request->user_email)) {
                $discount = $promoCode->calculateDiscount($request->subtotal, $request->items ?? []);
                
                if ($discount > $bestDiscount) {
                    $bestDiscount = $discount;
                    $bestPromoCode = $promoCode;
                }
            }
        }

        if ($bestPromoCode && $bestDiscount > 0) {
            return response()->json([
                'success' => true,
                'message' => 'Auto-apply promo code found',
                'data' => [
                    'promo_code' => $bestPromoCode->only(['id', 'code', 'name', 'type', 'value']),
                    'discount_amount' => $bestDiscount,
                    'new_total' => max(0, $request->subtotal - $bestDiscount)
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No auto-apply promo codes available'
        ]);
    }

    /**
     * Remove promo code from cart.
     */
    public function remove()
    {
        return response()->json([
            'success' => true,
            'message' => 'Promo code removed'
        ]);
    }
}