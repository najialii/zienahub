<?php

namespace App\Http\Controllers;

use App\Models\GiftBox;
use App\Models\GiftBoxItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class GiftBoxController extends Controller
{
    /**
     * Get or create an active gift box for the current user
     */
    public function getCurrent(Request $request)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                // Return empty gift box for guests
                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => null,
                        'name' => null,
                        'total_price' => 0,
                        'status' => 'active',
                        'items' => [],
                        'created_at' => null,
                        'updated_at' => null,
                    ]
                ]);
            }

            $giftBox = GiftBox::with(['items.product.subcategory.category'])
                ->where('status', 'active')
                ->where('user_id', $userId)
                ->first();

            if (!$giftBox) {
                $giftBox = GiftBox::create([
                    'user_id' => $userId,
                    'name' => 'My Custom Gift Box',
                    'status' => 'active',
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $this->formatGiftBox($giftBox)
            ]);

        } catch (Exception $e) {
            Log::error('Error getting gift box: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get gift box',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Add item to gift box
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1',
        ]);

        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please login to create a gift box',
                ], 401);
            }

            DB::beginTransaction();

            $productId = $request->product_id;
            $quantity = $request->quantity ?? 1;

            // Get or create gift box
            $giftBox = GiftBox::where('status', 'active')
                ->where('user_id', $userId)
                ->first();

            if (!$giftBox) {
                $giftBox = GiftBox::create([
                    'user_id' => $userId,
                    'name' => 'My Custom Gift Box',
                    'status' => 'active',
                ]);
            }

            // Get product
            $product = Product::findOrFail($productId);

            // Check stock
            $existingItem = GiftBoxItem::where('gift_box_id', $giftBox->id)
                ->where('product_id', $productId)
                ->first();

            $totalQuantity = $quantity + ($existingItem ? $existingItem->quantity : 0);

            if ($totalQuantity > $product->stock_quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock',
                    'available' => $product->stock_quantity,
                ], 400);
            }

            // Add or update item
            if ($existingItem) {
                $existingItem->quantity += $quantity;
                $existingItem->save();
            } else {
                GiftBoxItem::create([
                    'gift_box_id' => $giftBox->id,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'price_at_addition' => $product->price,
                ]);
            }

            $giftBox->load(['items.product.subcategory.category']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Item added to gift box',
                'data' => $this->formatGiftBox($giftBox)
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error adding item to gift box: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Update item quantity
     */
    public function updateItem(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            $item = GiftBoxItem::with('product')->findOrFail($itemId);
            $giftBox = $item->giftBox;

            // Verify ownership
            $userId = Auth::id();

            if (!$userId || $giftBox->user_id !== $userId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $quantity = $request->quantity;

            // Remove if quantity is 0
            if ($quantity === 0) {
                $item->delete();
            } else {
                // Check stock
                if ($quantity > $item->product->stock_quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Insufficient stock',
                        'available' => $item->product->stock_quantity,
                    ], 400);
                }

                $item->quantity = $quantity;
                $item->save();
            }

            $giftBox->load(['items.product.subcategory.category']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Item updated',
                'data' => $this->formatGiftBox($giftBox)
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error updating gift box item: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update item',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Remove item from gift box
     */
    public function removeItem(Request $request, $itemId)
    {
        try {
            DB::beginTransaction();

            $item = GiftBoxItem::findOrFail($itemId);
            $giftBox = $item->giftBox;

            // Verify ownership
            $userId = Auth::id();

            if (!$userId || $giftBox->user_id !== $userId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $item->delete();
            $giftBox->load(['items.product.subcategory.category']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Item removed',
                'data' => $this->formatGiftBox($giftBox)
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error removing gift box item: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Update gift box name
     */
    public function updateMessage(Request $request)
    {
        $request->validate([
            'message' => 'nullable|string|max:500', // For compatibility, but we'll store in name
            'name' => 'nullable|string|max:100',
        ]);

        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please login to update gift box',
                ], 401);
            }

            $giftBox = GiftBox::where('status', 'active')
                ->where('user_id', $userId)
                ->firstOrFail();

            // Store message in name field for now
            if ($request->has('name')) {
                $giftBox->name = $request->name;
            } elseif ($request->has('message')) {
                $giftBox->name = $request->message;
            }
            $giftBox->save();

            return response()->json([
                'success' => true,
                'message' => 'Gift box updated',
                'data' => $this->formatGiftBox($giftBox)
            ]);

        } catch (Exception $e) {
            Log::error('Error updating gift box: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update gift box',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Clear gift box
     */
    public function clear(Request $request)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please login',
                ], 401);
            }

            $giftBox = GiftBox::where('status', 'active')
                ->where('user_id', $userId)
                ->first();

            if ($giftBox) {
                $giftBox->items()->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Gift box cleared'
            ]);

        } catch (Exception $e) {
            Log::error('Error clearing gift box: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear gift box',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Format gift box for response
     */
    private function formatGiftBox($giftBox)
    {
        $totalPrice = $giftBox->items->sum(function ($item) {
            return $item->price_at_addition * $item->quantity;
        });

        return [
            'id' => $giftBox->id,
            'name' => $giftBox->name,
            'message' => $giftBox->name, // Use name as message for compatibility
            'total_price' => (float) $totalPrice,
            'status' => $giftBox->status,
            'items' => $giftBox->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price_at_addition,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'slug' => $item->product->slug,
                        'price' => (float) $item->product->price,
                        'stock_quantity' => $item->product->stock_quantity,
                        'image_url' => $item->product->image_url,
                        'category' => $item->product->subcategory && $item->product->subcategory->category ? [
                            'id' => $item->product->subcategory->category->id,
                            'name' => $item->product->subcategory->category->name,
                            'slug' => $item->product->subcategory->category->slug,
                        ] : null,
                    ],
                ];
            }),
            'created_at' => $giftBox->created_at,
            'updated_at' => $giftBox->updated_at,
        ];
    }
}
