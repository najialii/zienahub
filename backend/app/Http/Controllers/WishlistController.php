<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist
     */
    public function index(Request $request)
    {
        $wishlist = $request->user()
            ->wishlists()
            ->with(['product.translations', 'product.subcategory.category'])
            ->get()
            ->map(function ($item) {
                $product = $item->product;
                return [
                    'id' => $item->id,
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'image_url' => $product->image_url,
                    'added_at' => $item->created_at->timestamp,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $wishlist,
        ]);
    }

    /**
     * Add product to wishlist
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
            ]);

            $exists = $request->user()
                ->wishlists()
                ->where('product_id', $validated['product_id'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product already in wishlist',
                ], 400);
            }

            $wishlist = $request->user()->wishlists()->create([
                'product_id' => $validated['product_id'],
            ]);

            $wishlist->load(['product.translations', 'product.subcategory.category']);

            return response()->json([
                'success' => true,
                'message' => 'Product added to wishlist',
                'data' => [
                    'id' => $wishlist->id,
                    'product_id' => $wishlist->product->id,
                    'name' => $wishlist->product->name,
                    'slug' => $wishlist->product->slug,
                    'price' => $wishlist->product->price,
                    'image_url' => $wishlist->product->image_url,
                    'added_at' => $wishlist->created_at->timestamp,
                ],
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Wishlist store error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to add product to wishlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove product from wishlist
     */
    public function destroy(Request $request, $productId)
    {
        \Log::info('Removing product from wishlist', [
            'user_id' => $request->user()->id,
            'product_id' => $productId,
        ]);

        $deleted = $request->user()
            ->wishlists()
            ->where('product_id', $productId)
            ->delete();

        if (!$deleted) {
            \Log::warning('Product not found in wishlist', [
                'user_id' => $request->user()->id,
                'product_id' => $productId,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Product not found in wishlist',
            ], 404);
        }

        \Log::info('Product removed from wishlist successfully', [
            'user_id' => $request->user()->id,
            'product_id' => $productId,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product removed from wishlist',
        ]);
    }

    /**
     * Clear entire wishlist
     */
    public function clear(Request $request)
    {
        $request->user()->wishlists()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Wishlist cleared',
        ]);
    }

    /**
     * Check if product is in wishlist
     */
    public function check(Request $request, $productId)
    {
        $exists = $request->user()
            ->wishlists()
            ->where('product_id', $productId)
            ->exists();

        return response()->json([
            'success' => true,
            'data' => [
                'in_wishlist' => $exists,
            ],
        ]);
    }
}
