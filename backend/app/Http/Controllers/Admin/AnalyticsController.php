<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Get comprehensive analytics dashboard data
     */
    public function dashboard(Request $request)
    {
        try {
            $period = $request->get('period', '30'); // days
            $startDate = Carbon::now()->subDays($period);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'overview' => $this->getOverviewMetrics($startDate),
                    'revenue' => $this->getRevenueAnalytics($startDate),
                    'orders' => $this->getOrderAnalytics($startDate),
                    'products' => $this->getProductAnalytics($startDate),
                    'categories' => $this->getCategoryAnalytics($startDate),
                    'customers' => $this->getCustomerAnalytics($startDate),
                    'trends' => $this->getTrendAnalytics($startDate),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Analytics dashboard error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get overview metrics
     */
    private function getOverviewMetrics($startDate)
    {
        $currentPeriodOrders = Order::where('created_at', '>=', $startDate)->get();
        $previousPeriodStart = $startDate->copy()->subDays($startDate->diffInDays(Carbon::now()));
        $previousPeriodOrders = Order::whereBetween('created_at', [$previousPeriodStart, $startDate])->get();

        $currentRevenue = $currentPeriodOrders->sum('total_amount');
        $previousRevenue = $previousPeriodOrders->sum('total_amount');
        $revenueChange = $previousRevenue > 0 
            ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100 
            : 0;

        $currentOrderCount = $currentPeriodOrders->count();
        $previousOrderCount = $previousPeriodOrders->count();
        $orderChange = $previousOrderCount > 0 
            ? (($currentOrderCount - $previousOrderCount) / $previousOrderCount) * 100 
            : 0;

        $avgOrderValue = $currentOrderCount > 0 ? $currentRevenue / $currentOrderCount : 0;
        $previousAvgOrderValue = $previousOrderCount > 0 ? $previousRevenue / $previousOrderCount : 0;
        $avgOrderValueChange = $previousAvgOrderValue > 0 
            ? (($avgOrderValue - $previousAvgOrderValue) / $previousAvgOrderValue) * 100 
            : 0;

        // Conversion rate (orders / unique customers who placed orders)
        $uniqueCustomers = $currentPeriodOrders->pluck('user_id')->unique()->count();
        $conversionRate = $uniqueCustomers > 0 ? ($currentOrderCount / $uniqueCustomers) * 100 : 0;

        return [
            'total_revenue' => round($currentRevenue, 2),
            'revenue_change' => round($revenueChange, 2),
            'total_orders' => $currentOrderCount,
            'order_change' => round($orderChange, 2),
            'avg_order_value' => round($avgOrderValue, 2),
            'avg_order_value_change' => round($avgOrderValueChange, 2),
            'conversion_rate' => round($conversionRate, 2),
            'total_customers' => User::where('role', 'customer')->count(),
            'new_customers' => User::where('role', 'customer')
                ->where('created_at', '>=', $startDate)
                ->count(),
        ];
    }

    /**
     * Get revenue analytics with time series
     */
    private function getRevenueAnalytics($startDate)
    {
        $days = $startDate->diffInDays(Carbon::now());
        
        // Determine grouping based on period
        if ($days <= 7) {
            $groupBy = 'hour';
            $format = '%Y-%m-%d %H:00:00';
        } elseif ($days <= 30) {
            $groupBy = 'day';
            $format = '%Y-%m-%d';
        } elseif ($days <= 90) {
            $groupBy = 'week';
            $format = '%Y-%u';
        } else {
            $groupBy = 'month';
            $format = '%Y-%m';
        }

        $revenueByTime = Order::where('created_at', '>=', $startDate)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '$format') as period"),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('AVG(total_amount) as avg_order_value')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        // Revenue by status
        $revenueByStatus = Order::where('created_at', '>=', $startDate)
            ->select('status', DB::raw('SUM(total_amount) as revenue'), DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        // Revenue by payment method - skipped as payment_method field doesn't exist
        $revenueByPayment = collect([]);

        return [
            'time_series' => $revenueByTime,
            'by_status' => $revenueByStatus,
            'by_payment_method' => $revenueByPayment,
            'total_revenue' => $revenueByTime->sum('revenue'),
            'avg_daily_revenue' => $days > 0 ? $revenueByTime->sum('revenue') / $days : 0,
        ];
    }

    /**
     * Get order analytics
     */
    private function getOrderAnalytics($startDate)
    {
        $orders = Order::where('created_at', '>=', $startDate)->get();

        // Orders by status
        $ordersByStatus = Order::where('created_at', '>=', $startDate)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // Orders by hour of day
        $ordersByHour = Order::where('created_at', '>=', $startDate)
            ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('COUNT(*) as count'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Orders by day of week
        $ordersByDayOfWeek = Order::where('created_at', '>=', $startDate)
            ->select(DB::raw('DAYOFWEEK(created_at) as day'), DB::raw('COUNT(*) as count'))
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // Average fulfillment time (pending to delivered) - skipped as delivered_at field doesn't exist
        $avgFulfillmentTime = (object)['avg_hours' => 0];

        return [
            'total_orders' => $orders->count(),
            'by_status' => $ordersByStatus,
            'by_hour' => $ordersByHour,
            'by_day_of_week' => $ordersByDayOfWeek,
            'avg_fulfillment_hours' => $avgFulfillmentTime->avg_hours ?? 0,
            'avg_items_per_order' => $orders->count() > 0 
                ? DB::table('order_items')
                    ->whereIn('order_id', $orders->pluck('id'))
                    ->sum('quantity') / $orders->count()
                : 0,
        ];
    }

    /**
     * Get product analytics
     */
    private function getProductAnalytics($startDate)
    {
        // Top selling products
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('product_translations', function($join) {
                $join->on('products.id', '=', 'product_translations.product_id')
                     ->where('product_translations.locale', '=', 'en');
            })
            ->where('orders.created_at', '>=', $startDate)
            ->select(
                'products.id',
                'product_translations.name',
                'products.slug',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.quantity * order_items.price_at_purchase) as total_revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as order_count')
            )
            ->groupBy('products.id', 'product_translations.name', 'products.slug')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        // Low stock products
        $lowStockProducts = DB::table('products')
            ->join('product_translations', function($join) {
                $join->on('products.id', '=', 'product_translations.product_id')
                     ->where('product_translations.locale', '=', 'en');
            })
            ->where('products.stock_quantity', '>', 0)
            ->where('products.stock_quantity', '<=', 10)
            ->select('products.id', 'product_translations.name', 'products.stock_quantity', 'products.price')
            ->orderBy('products.stock_quantity')
            ->limit(10)
            ->get();

        // Out of stock products
        $outOfStockCount = Product::where('stock_quantity', 0)->count();

        // Products never sold
        $neverSoldProducts = DB::table('products')
            ->join('product_translations', function($join) {
                $join->on('products.id', '=', 'product_translations.product_id')
                     ->where('product_translations.locale', '=', 'en');
            })
            ->whereNotIn('products.id', function($query) use ($startDate) {
                $query->select('product_id')
                    ->from('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.created_at', '>=', $startDate);
            })
            ->select('products.id', 'product_translations.name', 'products.price', 'products.stock_quantity', 'products.created_at')
            ->orderBy('products.created_at', 'desc')
            ->limit(10)
            ->get();

        return [
            'top_selling' => $topProducts,
            'low_stock' => $lowStockProducts,
            'out_of_stock_count' => $outOfStockCount,
            'never_sold' => $neverSoldProducts,
            'total_products' => Product::count(),
            'active_products' => Product::where('status', 'active')->count(),
        ];
    }

    /**
     * Get category analytics
     */
    private function getCategoryAnalytics($startDate)
    {
        try {
            // Revenue by category
            $categoryRevenue = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->join('subcategories', 'products.subcategory_id', '=', 'subcategories.id')
                ->join('categories', 'subcategories.category_id', '=', 'categories.id')
                ->join('category_translations', function($join) {
                    $join->on('categories.id', '=', 'category_translations.category_id')
                         ->where('category_translations.locale', '=', 'en');
                })
                ->where('orders.created_at', '>=', $startDate)
                ->select(
                    'categories.id',
                    'category_translations.name',
                    'categories.slug',
                    DB::raw('SUM(order_items.quantity * order_items.price_at_purchase) as revenue'),
                    DB::raw('SUM(order_items.quantity) as quantity_sold'),
                    DB::raw('COUNT(DISTINCT orders.id) as order_count')
                )
                ->groupBy('categories.id', 'category_translations.name', 'categories.slug')
                ->orderByDesc('revenue')
                ->get();

            $totalRevenue = $categoryRevenue->sum('revenue');

            // Add percentage
            $categoryRevenue = $categoryRevenue->map(function($cat) use ($totalRevenue) {
                $cat->percentage = $totalRevenue > 0 ? ($cat->revenue / $totalRevenue) * 100 : 0;
                return $cat;
            });

            return [
                'by_revenue' => $categoryRevenue,
                'total_categories' => Category::count(),
            ];
        } catch (\Exception $e) {
            \Log::error('Category analytics error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return empty data on error
            return [
                'by_revenue' => collect([]),
                'total_categories' => 0,
            ];
        }
    }

    /**
     * Get customer analytics
     */
    private function getCustomerAnalytics($startDate)
    {
        $customers = User::where('role', 'customer')->get();
        $newCustomers = User::where('role', 'customer')
            ->where('created_at', '>=', $startDate)
            ->get();

        // Customer lifetime value
        $customerLTV = DB::table('orders')
            ->select('user_id', DB::raw('SUM(total_amount) as lifetime_value'))
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->get();

        $avgLTV = $customerLTV->count() > 0 ? $customerLTV->avg('lifetime_value') : 0;

        // Top customers
        $topCustomers = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->whereNotNull('orders.user_id')
            ->where('orders.created_at', '>=', $startDate)
            ->select(
                'users.id',
                'users.name',
                'users.email',
                DB::raw('COUNT(orders.id) as order_count'),
                DB::raw('SUM(orders.total_amount) as total_spent')
            )
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('total_spent')
            ->limit(10)
            ->get();

        // Repeat customer rate
        $customersWithOrders = DB::table('orders')
            ->whereNotNull('user_id')
            ->where('created_at', '>=', $startDate)
            ->select('user_id', DB::raw('COUNT(*) as order_count'))
            ->groupBy('user_id')
            ->get();

        $repeatCustomers = $customersWithOrders->where('order_count', '>', 1)->count();
        $totalCustomersWithOrders = $customersWithOrders->count();
        $repeatRate = $totalCustomersWithOrders > 0 
            ? ($repeatCustomers / $totalCustomersWithOrders) * 100 
            : 0;

        // Customer acquisition by source (if tracked)
        $customersBySource = User::where('role', 'customer')
            ->where('created_at', '>=', $startDate)
            ->select(
                DB::raw('CASE WHEN google_id IS NOT NULL THEN "Google" ELSE "Email" END as source'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('source')
            ->get();

        return [
            'total_customers' => $customers->count(),
            'new_customers' => $newCustomers->count(),
            'avg_lifetime_value' => round($avgLTV, 2),
            'top_customers' => $topCustomers,
            'repeat_customer_rate' => round($repeatRate, 2),
            'by_source' => $customersBySource,
        ];
    }

    /**
     * Get trend analytics
     */
    private function getTrendAnalytics($startDate)
    {
        $days = $startDate->diffInDays(Carbon::now());
        
        // Daily trends
        $dailyTrends = Order::where('created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as orders'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('AVG(total_amount) as avg_order_value')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Calculate growth rates
        $recentRevenue = $dailyTrends->take(-7)->sum('revenue');
        $previousRevenue = $dailyTrends->slice(-14, 7)->sum('revenue');
        $revenueGrowth = $previousRevenue > 0 
            ? (($recentRevenue - $previousRevenue) / $previousRevenue) * 100 
            : 0;

        // Peak hours
        $peakHours = Order::where('created_at', '>=', $startDate)
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('hour')
            ->orderByDesc('order_count')
            ->limit(5)
            ->get();

        return [
            'daily_trends' => $dailyTrends,
            'revenue_growth_7d' => round($revenueGrowth, 2),
            'peak_hours' => $peakHours,
        ];
    }

    /**
     * Export analytics data
     */
    public function export(Request $request)
    {
        // This would generate a CSV/Excel export
        // Implementation depends on requirements
        return response()->json([
            'success' => true,
            'message' => 'Export functionality to be implemented'
        ]);
    }
}
