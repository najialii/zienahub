<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\User;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get cart for a specific customer
     */
    public function getCustomerCart($userId)
    {
        try {
            $user = User::findOrFail($userId);
            $cartSummary = Cart::getCartSummary($userId);

            return response()->json([
                'success' => true,
                'data' => [
                    'customer' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ],
                    'cart' => $cartSummary,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin get customer cart error:', [
                'message' => $e->getMessage(),
                'user_id' => $userId,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customer cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all abandoned carts (carts with items but no recent orders)
     */
    public function getAbandonedCarts(Request $request)
    {
        try {
            $query = Cart::select('user_id')
                ->selectRaw('COUNT(*) as item_count')
                ->selectRaw('SUM(product_price * quantity) as total_amount')
                ->selectRaw('MAX(updated_at) as last_updated')
                ->with(['user:id,name,email'])
                ->groupBy('user_id')
                ->having('item_count', '>', 0);

            // Filter by days since last update
            $daysSince = $request->get('days_since', 1);
            $query->whereRaw('updated_at < DATE_SUB(NOW(), INTERVAL ? DAY)', [$daysSince]);

            $abandonedCarts = $query->orderBy('last_updated', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $abandonedCarts->map(function ($cart) {
                    return [
                        'user_id' => $cart->user_id,
                        'customer_name' => $cart->user->name ?? 'Unknown',
                        'customer_email' => $cart->user->email ?? 'Unknown',
                        'item_count' => $cart->item_count,
                        'total_amount' => $cart->total_amount,
                        'last_updated' => $cart->last_updated,
                        'days_ago' => now()->diffInDays($cart->last_updated),
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin get abandoned carts error:', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch abandoned carts',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get cart statistics
     */
    public function getCartStats()
    {
        try {
            $stats = [
                'total_active_carts' => Cart::distinct('user_id')->count(),
                'total_cart_items' => Cart::sum('quantity'),
                'total_cart_value' => Cart::selectRaw('SUM(product_price * quantity) as total')->value('total') ?? 0,
                'abandoned_carts_24h' => Cart::select('user_id')
                    ->whereRaw('updated_at < DATE_SUB(NOW(), INTERVAL 1 DAY)')
                    ->distinct('user_id')
                    ->count(),
                'abandoned_carts_7d' => Cart::select('user_id')
                    ->whereRaw('updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)')
                    ->distinct('user_id')
                    ->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin get cart stats error:', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cart statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}