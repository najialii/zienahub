<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Get user's cart items
     */
    public function index(Request $request)
    {
        try {
            $userId = Auth::id();
            $cartSummary = Cart::getCartSummary($userId);

            return response()->json([
                'success' => true,
                'data' => $cartSummary,
            ]);
        } catch (\Exception $e) {
            \Log::error('Cart index error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add item to cart
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1',
            ]);

            $userId = Auth::id();
            $product = Product::findOrFail($validated['product_id']);

            // Check if item already exists in cart
            $cartItem = Cart::where('user_id', $userId)
                ->where('product_id', $validated['product_id'])
                ->first();

            if ($cartItem) {
                // Update quantity
                $cartItem->quantity = $validated['quantity'];
                $cartItem->save();
            } else {
                // Create new cart item
                $cartItem = Cart::create([
                    'user_id' => $userId,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_slug' => $product->slug,
                    'product_price' => $product->price,
                    'product_image_url' => $product->image_url,
                    'product_sku' => $product->sku,
                    'quantity' => $validated['quantity'],
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Item added to cart',
                'data' => $cartItem,
            ]);
        } catch (\Exception $e) {
            \Log::error('Cart store error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:0',
            ]);

            $userId = Auth::id();
            $cartItem = Cart::where('user_id', $userId)->findOrFail($id);

            if ($validated['quantity'] == 0) {
                $cartItem->delete();
                $message = 'Item removed from cart';
            } else {
                $cartItem->quantity = $validated['quantity'];
                $cartItem->save();
                $message = 'Cart updated';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $cartItem,
            ]);
        } catch (\Exception $e) {
            \Log::error('Cart update error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove item from cart
     */
    public function destroy($id)
    {
        try {
            $userId = Auth::id();
            $cartItem = Cart::where('user_id', $userId)->findOrFail($id);
            $cartItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart',
            ]);
        } catch (\Exception $e) {
            \Log::error('Cart destroy error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item from cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear entire cart
     */
    public function clear()
    {
        try {
            $userId = Auth::id();
            Cart::where('user_id', $userId)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cart cleared',
            ]);
        } catch (\Exception $e) {
            \Log::error('Cart clear error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync cart from frontend (for when user logs in)
     */
    public function sync(Request $request)
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            $userId = Auth::id();

            // Clear existing cart
            Cart::where('user_id', $userId)->delete();

            // Add new items
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                Cart::create([
                    'user_id' => $userId,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_slug' => $product->slug,
                    'product_price' => $product->price,
                    'product_image_url' => $product->image_url,
                    'product_sku' => $product->sku,
                    'quantity' => $item['quantity'],
                ]);
            }

            $cartSummary = Cart::getCartSummary($userId);

            return response()->json([
                'success' => true,
                'message' => 'Cart synced successfully',
                'data' => $cartSummary,
            ]);
        } catch (\Exception $e) {
            \Log::error('Cart sync error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to sync cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}