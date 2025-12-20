<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    /**
     * Get all customers with their statistics
     */
    public function index(Request $request)
    {
        try {
            $query = User::where('role', 'customer')
                ->withCount('orders')
                ->withSum('orders as total_spent', 'total_amount');

            // Search functionality
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Order by most recent
            $query->orderBy('created_at', 'desc');

            // Pagination
            $perPage = $request->per_page ?? 20;
            $customers = $query->paginate($perPage);

            // Transform data for frontend
            $customers->getCollection()->transform(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'avatar' => $customer->avatar,
                    'orders_count' => $customer->orders_count ?? 0,
                    'total_spent' => (float) ($customer->total_spent ?? 0),
                    'created_at' => $customer->created_at,
                    'status' => 'active', // Can be extended with actual status field
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $customers->items(),
                'pagination' => [
                    'current_page' => $customers->currentPage(),
                    'last_page' => $customers->lastPage(),
                    'per_page' => $customers->perPage(),
                    'total' => $customers->total(),
                    'from' => $customers->firstItem(),
                    'to' => $customers->lastItem(),
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch customers', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single customer details with full statistics
     */
    public function show($id)
    {
        try {
            $customer = User::where('role', 'customer')
                ->where('id', $id)
                ->firstOrFail();

            // Get order statistics
            $orderStats = Order::where('user_id', $id)
                ->select(
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total_amount) as total_spent'),
                    DB::raw('AVG(total_amount) as average_order_value'),
                    DB::raw('MAX(created_at) as last_order_date')
                )
                ->first();

            // Get orders by status
            $ordersByStatus = Order::where('user_id', $id)
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status');

            // Get recent orders
            $recentOrders = Order::where('user_id', $id)
                ->with('items.product')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            // Get wishlist count
            $wishlistCount = $customer->wishlists()->count();

            // Get addresses count
            $addressesCount = $customer->addresses()->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'customer' => [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'email' => $customer->email,
                        'avatar' => $customer->avatar,
                        'created_at' => $customer->created_at,
                        'status' => 'active',
                    ],
                    'statistics' => [
                        'total_orders' => $orderStats->total_orders ?? 0,
                        'total_spent' => (float) ($orderStats->total_spent ?? 0),
                        'average_order_value' => (float) ($orderStats->average_order_value ?? 0),
                        'last_order_date' => $orderStats->last_order_date,
                        'wishlist_items' => $wishlistCount,
                        'saved_addresses' => $addressesCount,
                    ],
                    'orders_by_status' => $ordersByStatus,
                    'recent_orders' => $recentOrders,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch customer details', [
                'customer_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch customer details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get customer statistics summary
     */
    public function statistics()
    {
        try {
            $totalCustomers = User::where('role', 'customer')->count();
            
            // Customers with orders
            $customersWithOrders = User::where('role', 'customer')
                ->has('orders')
                ->count();

            // New customers this month
            $newCustomersThisMonth = User::where('role', 'customer')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            // Total revenue from all customers
            $totalRevenue = Order::sum('total_amount');

            // Average customer lifetime value
            $avgLifetimeValue = $totalCustomers > 0 
                ? $totalRevenue / $totalCustomers 
                : 0;

            // Top customers by spending
            $topCustomers = User::where('role', 'customer')
                ->withSum('orders as total_spent', 'total_amount')
                ->orderBy('total_spent', 'desc')
                ->take(5)
                ->get()
                ->map(function($customer) {
                    return [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'email' => $customer->email,
                        'total_spent' => (float) ($customer->total_spent ?? 0),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'total_customers' => $totalCustomers,
                    'customers_with_orders' => $customersWithOrders,
                    'new_customers_this_month' => $newCustomersThisMonth,
                    'total_revenue' => (float) $totalRevenue,
                    'average_lifetime_value' => (float) $avgLifetimeValue,
                    'top_customers' => $topCustomers,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch customer statistics', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
