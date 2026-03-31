<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Cart;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Get all customers with pagination and search
     */
    public function index(Request $request)
    {
        try {
            $query = User::where('role', 'customer')
                ->withCount(['orders', 'cartItems'])
                ->withSum('orders', 'total_amount');

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 20);
            $customers = $query->orderBy('created_at', 'desc')->paginate($perPage);

            // Transform the data to include additional fields
            $customers->getCollection()->transform(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'role' => $customer->role,
                    'created_at' => $customer->created_at,
                    'orders_count' => $customer->orders_count,
                    'cart_items_count' => $customer->cart_items_count,
                    'total_spent' => $customer->orders_sum_total_amount ?? 0,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $customers->items(),
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin customers index error:', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get specific customer details
     */
    public function show($id)
    {
        try {
            $customer = User::where('id', $id)
                ->where('role', 'customer')
                ->withCount(['orders', 'cartItems', 'wishlists'])
                ->withSum('orders', 'total_amount')
                ->first();

            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found',
                ], 404);
            }

            // Get recent orders
            $recentOrders = $customer->orders()
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['id', 'total_amount', 'status', 'created_at']);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'role' => $customer->role,
                    'created_at' => $customer->created_at,
                    'orders_count' => $customer->orders_count,
                    'cart_items_count' => $customer->cart_items_count,
                    'wishlist_count' => $customer->wishlists_count,
                    'total_spent' => $customer->orders_sum_total_amount ?? 0,
                    'recent_orders' => $recentOrders,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin customer show error:', [
                'message' => $e->getMessage(),
                'customer_id' => $id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customer details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer timeline - all activities since joining
     */
    public function getTimeline($id)
    {
        try {
            $customer = User::where('id', $id)
                ->where('role', 'customer')
                ->first();

            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found',
                ], 404);
            }

            $timeline = collect();

            // Account creation
            $timeline->push([
                'id' => 'account_created',
                'type' => 'account_created',
                'title' => 'Account Created',
                'description' => 'Customer joined the platform',
                'data' => [
                    'name' => $customer->name,
                    'email' => $customer->email,
                ],
                'created_at' => $customer->created_at,
                'icon' => 'user-plus',
                'color' => 'green'
            ]);

            // Orders with detailed status tracking
            $orders = $customer->orders()
                ->with(['items.product', 'deliveryPerson', 'promoCode'])
                ->orderBy('created_at', 'desc')
                ->get();

            foreach ($orders as $order) {
                // Order placed
                $timeline->push([
                    'id' => 'order_placed_' . $order->id,
                    'type' => 'order_placed',
                    'title' => 'Order Placed',
                    'description' => "Order #{$order->order_number} - {$order->items->count()} items",
                    'data' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'total_amount' => $order->total_amount,
                        'subtotal_amount' => $order->subtotal_amount,
                        'discount_amount' => $order->discount_amount,
                        'status' => $order->status,
                        'items_count' => $order->items->count(),
                        'promo_code' => $order->promo_code,
                        'is_gift' => $order->is_gift,
                        'recipient_name' => $order->recipient_name,
                        'items' => $order->items->map(function ($item) {
                            return [
                                'product_name' => $item->product->name ?? 'Unknown Product',
                                'quantity' => $item->quantity,
                                'price' => $item->price_at_purchase,
                            ];
                        }),
                    ],
                    'created_at' => $order->created_at,
                    'icon' => 'shopping-bag',
                    'color' => 'blue'
                ]);

                // Order status progression
                if ($order->status === 'processing' && $order->status_updated_at) {
                    $timeline->push([
                        'id' => 'order_processing_' . $order->id,
                        'type' => 'order_status_change',
                        'title' => 'Order Processing',
                        'description' => "Order #{$order->order_number} is being processed",
                        'data' => [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'status' => 'processing',
                            'previous_status' => 'pending',
                        ],
                        'created_at' => $order->status_updated_at,
                        'icon' => 'clock',
                        'color' => 'orange'
                    ]);
                }

                if ($order->assigned_at && $order->delivery_person_id) {
                    $timeline->push([
                        'id' => 'order_assigned_' . $order->id,
                        'type' => 'order_assigned',
                        'title' => 'Delivery Assigned',
                        'description' => "Order #{$order->order_number} assigned to delivery personnel",
                        'data' => [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'delivery_person' => $order->deliveryPerson->name ?? 'Delivery Person',
                        ],
                        'created_at' => $order->assigned_at,
                        'icon' => 'package',
                        'color' => 'indigo'
                    ]);
                }

                if ($order->status === 'shipped' && $order->tracking_number) {
                    $timeline->push([
                        'id' => 'order_shipped_' . $order->id,
                        'type' => 'order_shipped',
                        'title' => 'Order Shipped',
                        'description' => "Order #{$order->order_number} has been shipped",
                        'data' => [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'tracking_number' => $order->tracking_number,
                            'tracking_carrier' => $order->tracking_carrier,
                        ],
                        'created_at' => $order->status_updated_at ?? $order->updated_at,
                        'icon' => 'package',
                        'color' => 'blue'
                    ]);
                }

                if ($order->status === 'delivered' && $order->delivered_at) {
                    $timeline->push([
                        'id' => 'order_delivered_' . $order->id,
                        'type' => 'order_delivered',
                        'title' => 'Order Delivered',
                        'description' => "Order #{$order->order_number} was successfully delivered",
                        'data' => [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'total_amount' => $order->total_amount,
                            'delivery_notes' => $order->delivery_notes,
                            'delivery_person' => $order->deliveryPerson->name ?? 'Delivery Person',
                        ],
                        'created_at' => $order->delivered_at,
                        'icon' => 'check-circle',
                        'color' => 'green'
                    ]);
                }

                if ($order->status === 'cancelled') {
                    $timeline->push([
                        'id' => 'order_cancelled_' . $order->id,
                        'type' => 'order_cancelled',
                        'title' => 'Order Cancelled',
                        'description' => "Order #{$order->order_number} was cancelled",
                        'data' => [
                            'order_id' => $order->id,
                            'order_number' => $order->order_number,
                            'total_amount' => $order->total_amount,
                            'admin_notes' => $order->admin_notes,
                        ],
                        'created_at' => $order->status_updated_at ?? $order->updated_at,
                        'icon' => 'x-circle',
                        'color' => 'red'
                    ]);
                }
            }

            // Wishlist activities
            $wishlists = $customer->wishlists()
                ->with('product')
                ->orderBy('created_at', 'desc')
                ->get();

            foreach ($wishlists as $wishlist) {
                $timeline->push([
                    'id' => 'wishlist_' . $wishlist->id,
                    'type' => 'wishlist_added',
                    'title' => 'Added to Wishlist',
                    'description' => "Added \"{$wishlist->product->name}\" to wishlist",
                    'data' => [
                        'product_id' => $wishlist->product_id,
                        'product_name' => $wishlist->product->name,
                        'product_price' => $wishlist->product->price,
                        'product_image' => $wishlist->product->image_url ?? null,
                    ],
                    'created_at' => $wishlist->created_at,
                    'icon' => 'heart',
                    'color' => 'pink'
                ]);
            }

            // Cart activities (recent cart updates)
            $cartItems = $customer->cartItems()
                ->with('product')
                ->orderBy('updated_at', 'desc')
                ->limit(20)
                ->get();

            foreach ($cartItems as $cartItem) {
                $timeline->push([
                    'id' => 'cart_' . $cartItem->id . '_' . $cartItem->updated_at->timestamp,
                    'type' => 'cart_updated',
                    'title' => 'Cart Updated',
                    'description' => "Updated \"{$cartItem->product->name}\" in cart",
                    'data' => [
                        'product_id' => $cartItem->product_id,
                        'product_name' => $cartItem->product->name,
                        'quantity' => $cartItem->quantity,
                        'product_price' => $cartItem->product->price,
                        'product_image' => $cartItem->product->image_url ?? null,
                    ],
                    'created_at' => $cartItem->updated_at,
                    'icon' => 'shopping-cart',
                    'color' => 'orange'
                ]);
            }

            // Gift boxes
            if (class_exists('App\Models\GiftBox')) {
                $giftBoxes = $customer->giftBoxes()
                    ->orderBy('created_at', 'desc')
                    ->get();

                foreach ($giftBoxes as $giftBox) {
                    $timeline->push([
                        'id' => 'giftbox_' . $giftBox->id,
                        'type' => 'giftbox_created',
                        'title' => 'Gift Box Created',
                        'description' => "Created custom gift box: \"{$giftBox->name}\"",
                        'data' => [
                            'giftbox_id' => $giftBox->id,
                            'giftbox_name' => $giftBox->name,
                            'total_price' => $giftBox->total_price ?? 0,
                        ],
                        'created_at' => $giftBox->created_at,
                        'icon' => 'gift',
                        'color' => 'purple'
                    ]);
                }
            }

            // Addresses
            if (class_exists('App\Models\Address')) {
                $addresses = $customer->addresses()
                    ->orderBy('created_at', 'desc')
                    ->get();

                foreach ($addresses as $address) {
                    $timeline->push([
                        'id' => 'address_' . $address->id,
                        'type' => 'address_added',
                        'title' => 'Address Added',
                        'description' => "Added new delivery address in {$address->city}",
                        'data' => [
                            'address_id' => $address->id,
                            'address_line' => $address->address_line_1 ?? 'Address',
                            'city' => $address->city ?? '',
                            'is_default' => $address->is_default ?? false,
                        ],
                        'created_at' => $address->created_at,
                        'icon' => 'map-pin',
                        'color' => 'indigo'
                    ]);
                }
            }

            // Promo code usage
            if (class_exists('App\Models\PromoCodeUsage')) {
                $promoUsages = \App\Models\PromoCodeUsage::where('user_id', $customer->id)
                    ->with(['promoCode', 'order'])
                    ->orderBy('created_at', 'desc')
                    ->get();

                foreach ($promoUsages as $usage) {
                    $timeline->push([
                        'id' => 'promo_used_' . $usage->id,
                        'type' => 'promo_code_used',
                        'title' => 'Promo Code Used',
                        'description' => "Used promo code \"{$usage->promoCode->code}\" for {$usage->discount_amount} SAR discount",
                        'data' => [
                            'promo_code' => $usage->promoCode->code,
                            'discount_amount' => $usage->discount_amount,
                            'order_number' => $usage->order->order_number ?? null,
                        ],
                        'created_at' => $usage->created_at,
                        'icon' => 'tag',
                        'color' => 'green'
                    ]);
                }
            }

            // Sort timeline by date (newest first)
            $timeline = $timeline->sortByDesc('created_at')->values();

            // Calculate comprehensive stats
            $stats = [
                'total_events' => $timeline->count(),
                'orders_count' => $orders->count(),
                'wishlist_count' => $wishlists->count(),
                'cart_items_count' => $cartItems->count(),
                'total_spent' => $orders->sum('total_amount'),
                'average_order_value' => $orders->count() > 0 ? $orders->avg('total_amount') : 0,
                'delivered_orders' => $orders->where('status', 'delivered')->count(),
                'pending_orders' => $orders->where('status', 'pending')->count(),
                'cancelled_orders' => $orders->where('status', 'cancelled')->count(),
                'days_since_joined' => $customer->created_at->diffInDays(now()),
                'last_order_date' => $orders->first()?->created_at,
                'last_activity_date' => $timeline->first()['created_at'] ?? $customer->created_at,
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'customer' => [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'email' => $customer->email,
                        'created_at' => $customer->created_at,
                    ],
                    'timeline' => $timeline,
                    'stats' => $stats
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin customer timeline error:', [
                'message' => $e->getMessage(),
                'customer_id' => $id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customer timeline',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer statistics
     */
    public function getStats()
    {
        try {
            $stats = [
                'total_customers' => User::where('role', 'customer')->count(),
                'new_customers_this_month' => User::where('role', 'customer')
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'customers_with_orders' => User::where('role', 'customer')
                    ->whereHas('orders')
                    ->count(),
                'customers_with_active_carts' => User::where('role', 'customer')
                    ->whereHas('cartItems')
                    ->count(),
                'average_order_value' => Order::avg('total_amount') ?? 0,
                'total_revenue' => Order::sum('total_amount') ?? 0,
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            \Log::error('Admin customer stats error:', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customer statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}