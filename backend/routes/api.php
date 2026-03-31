<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\GiftBoxController;
use App\Http\Controllers\SuperAdmin\TenantManagementController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Debug route to check subcategories
Route::get('/debug/subcategories', function () {
    $subcategories = DB::table('subcategories')->get(['id', 'slug', 'category_id']);
    return response()->json($subcategories);
});

// Debug route to check recent products
Route::get('/debug/products', function () {
    $products = DB::table('products')->orderBy('created_at', 'desc')->limit(10)->get();
    return response()->json($products);
});

// Simple admin products route for testing with pagination
Route::get('/debug/admin-products', function (Request $request) {
    $perPage = $request->get('per_page', 10);
    $page = $request->get('page', 1);
    
    $query = App\Models\Product::with(['subcategory.category'])->orderBy('created_at', 'desc');
    
    // Apply search filter if provided
    if ($request->has('search') && $request->search) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%$search%")
              ->orWhere('sku', 'like', "%$search%")
              ->orWhere('description', 'like', "%$search%");
        });
    }
    
    // Apply status filter if provided
    if ($request->has('status') && $request->status !== 'all') {
        $query->where('status', $request->status);
    }
    
    $products = $query->paginate($perPage, ['*'], 'page', $page);
    
    // Format the products data to include full URLs
    $formattedProducts = $products->getCollection()->map(function ($product) {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'description' => $product->description,
            'price' => (float) $product->price,
            'stock_quantity' => $product->stock_quantity,
            'image_url' => $product->image_url ? url($product->image_url) : null,
            'status' => $product->status,
            'subcategory_id' => $product->subcategory_id,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
            'subcategory' => $product->subcategory ? [
                'id' => $product->subcategory->id,
                'name' => $product->subcategory->name,
                'category' => $product->subcategory->category ? [
                    'id' => $product->subcategory->category->id,
                    'name' => $product->subcategory->category->name,
                ] : null,
            ] : null,
        ];
    });
    
    return response()->json([
        'success' => true,
        'data' => $formattedProducts,
        'current_page' => $products->currentPage(),
        'last_page' => $products->lastPage(),
        'per_page' => $products->perPage(),
        'total' => $products->total(),
        'from' => $products->firstItem(),
        'to' => $products->lastItem(),
    ]);
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);
Route::middleware('auth:sanctum')->get('/profile', [AuthController::class, 'profile']);
Route::middleware('auth:sanctum')->post('/change-password', [AuthController::class, 'changePassword']);

// Google OAuth routes
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Address routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/addresses', [App\Http\Controllers\AddressController::class, 'index']);
    Route::post('/addresses', [App\Http\Controllers\AddressController::class, 'store']);
    Route::put('/addresses/{id}', [App\Http\Controllers\AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [App\Http\Controllers\AddressController::class, 'destroy']);
    Route::post('/addresses/{id}/set-default', [App\Http\Controllers\AddressController::class, 'setDefault']);
});

// Wishlist routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/wishlist', [App\Http\Controllers\WishlistController::class, 'index']);
    Route::post('/wishlist', [App\Http\Controllers\WishlistController::class, 'store']);
    Route::delete('/wishlist/{productId}', [App\Http\Controllers\WishlistController::class, 'destroy']);
    Route::delete('/wishlist', [App\Http\Controllers\WishlistController::class, 'clear']);
    Route::get('/wishlist/check/{productId}', [App\Http\Controllers\WishlistController::class, 'check']);
});

// Cart routes (protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/cart', [App\Http\Controllers\CartController::class, 'index']);
    Route::post('/cart', [App\Http\Controllers\CartController::class, 'store']);
    Route::put('/cart/{id}', [App\Http\Controllers\CartController::class, 'update']);
    Route::delete('/cart/{id}', [App\Http\Controllers\CartController::class, 'destroy']);
    Route::delete('/cart', [App\Http\Controllers\CartController::class, 'clear']);
    Route::post('/cart/sync', [App\Http\Controllers\CartController::class, 'sync']);
});

// Public API routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/categories/slug/{slug}', [CategoryController::class, 'showBySlug']);

// Public subcategory routes
Route::get('/subcategories', function () {
    try {
        $subcategories = App\Models\Subcategory::with(['category.translations', 'translations'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($subcategory) {
                return [
                    'id' => $subcategory->id,
                    'name' => $subcategory->getName('en'),
                    'name_ar' => $subcategory->getName('ar'),
                    'slug' => $subcategory->slug,
                    'description' => $subcategory->getDescription('en'),
                    'description_ar' => $subcategory->getDescription('ar'),
                    'category_id' => $subcategory->category_id,
                    'category' => $subcategory->category ? [
                        'id' => $subcategory->category->id,
                        'name' => $subcategory->category->getName('en'),
                        'name_ar' => $subcategory->category->getName('ar'),
                    ] : null,
                ];
            });

        return response()->json($subcategories);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching subcategories: ' . $e->getMessage(),
            'data' => []
        ], 500);
    }
});

// Featured subcategories with products
Route::get('/subcategories/featured', function () {
    try {
        $featuredSubcategories = App\Models\Subcategory::with(['category.translations', 'translations', 'products'])
            ->featured()
            ->orderedByFeatured()
            ->get()
            ->map(function($subcategory) {
                // Get featured products for this subcategory
                $products = $subcategory->getFeaturedProducts(4)->map(function($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'price' => $product->price,
                        'image_url' => $product->image_url,
                        'status' => $product->status,
                    ];
                });

                return [
                    'id' => $subcategory->id,
                    'name' => $subcategory->getName('en'),
                    'name_ar' => $subcategory->getName('ar'),
                    'slug' => $subcategory->slug,
                    'description' => $subcategory->getDescription('en'),
                    'description_ar' => $subcategory->getDescription('ar'),
                    'category_id' => $subcategory->category_id,
                    'featured_sort_order' => $subcategory->featured_sort_order,
                    'category' => $subcategory->category ? [
                        'id' => $subcategory->category->id,
                        'name' => $subcategory->category->getName('en'),
                        'name_ar' => $subcategory->category->getName('ar'),
                    ] : null,
                    'products' => $products,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $featuredSubcategories
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching featured subcategories: ' . $e->getMessage(),
            'data' => []
        ], 500);
    }
});

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/slug/{slug}', [ProductController::class, 'showBySlug']);
Route::get('/products/slug/{slug}/related', [ProductController::class, 'getRelatedProducts']);

// Gift Box routes (works for both authenticated and guest users)
Route::get('/gift-box', [GiftBoxController::class, 'getCurrent']);
Route::post('/gift-box/items', [GiftBoxController::class, 'addItem']);
Route::put('/gift-box/items/{id}', [GiftBoxController::class, 'updateItem']);
Route::delete('/gift-box/items/{id}', [GiftBoxController::class, 'removeItem']);
Route::put('/gift-box/message', [GiftBoxController::class, 'updateMessage']);
Route::delete('/gift-box', [GiftBoxController::class, 'clear']);

// Order routes (public - can be used by guests or authenticated users)
Route::post('/orders', [App\Http\Controllers\OrderController::class, 'store']);
Route::middleware('auth:sanctum')->get('/orders', [App\Http\Controllers\OrderController::class, 'index']);
Route::middleware('auth:sanctum')->get('/orders/{id}', [App\Http\Controllers\OrderController::class, 'show']);

// Admin product routes (protected - requires authentication and admin role)
Route::middleware(['auth:sanctum', 'tenant_admin'])->group(function () {
    Route::post('/admin/products', [ProductController::class, 'store']);
    Route::put('/admin/products/{id}', [ProductController::class, 'update']);
    Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'tenant_admin'])->group(function () {
    Route::get('/admin/products', [ProductController::class, 'adminIndex']);
    Route::get('/admin/products/{id}', [ProductController::class, 'adminShow']);
    
    // Admin order routes
    Route::put('/admin/orders/{id}/status', [App\Http\Controllers\OrderController::class, 'updateStatus']);
    Route::post('/admin/orders/bulk-update', [App\Http\Controllers\OrderController::class, 'bulkUpdateStatus']);
    Route::post('/admin/orders/{id}/notify-delivery', [App\Http\Controllers\OrderController::class, 'notifyDelivery']);
    Route::post('/admin/orders/bulk-notify-delivery', [App\Http\Controllers\OrderController::class, 'bulkNotifyDelivery']);
    Route::post('/admin/orders/{id}/mark-delivered', [App\Http\Controllers\OrderController::class, 'markDelivered']);
    Route::get('/admin/orders/unassigned', [App\Http\Controllers\OrderController::class, 'getUnassignedOrders']);
    
    // Admin customer routes
    Route::get('/admin/customers', [App\Http\Controllers\CustomerController::class, 'index']);
    Route::get('/admin/customers/statistics', [App\Http\Controllers\CustomerController::class, 'statistics']);
    Route::get('/admin/customers/{id}', [App\Http\Controllers\CustomerController::class, 'show']);
    
    // Admin category routes
    Route::get('/admin/categories', [App\Http\Controllers\Admin\CategoryController::class, 'index']);
    Route::get('/admin/categories/{id}', [App\Http\Controllers\Admin\CategoryController::class, 'show']);
    Route::post('/admin/categories', [App\Http\Controllers\Admin\CategoryController::class, 'store']);
    Route::put('/admin/categories/{id}', [App\Http\Controllers\Admin\CategoryController::class, 'update']);
    Route::delete('/admin/categories/{id}', [App\Http\Controllers\Admin\CategoryController::class, 'destroy']);
    
    // Admin subcategory routes
    Route::get('/admin/subcategories', [App\Http\Controllers\Admin\SubcategoryController::class, 'index']);
    Route::get('/admin/subcategories/{id}', [App\Http\Controllers\Admin\SubcategoryController::class, 'show']);
    Route::post('/admin/subcategories', [App\Http\Controllers\Admin\SubcategoryController::class, 'store']);
    Route::put('/admin/subcategories/{id}', [App\Http\Controllers\Admin\SubcategoryController::class, 'update']);
    Route::delete('/admin/subcategories/{id}', [App\Http\Controllers\Admin\SubcategoryController::class, 'destroy']);
    Route::post('/admin/subcategories/{id}/toggle-featured', [App\Http\Controllers\Admin\SubcategoryController::class, 'toggleFeatured']);
    
    // Admin analytics routes
    Route::get('/admin/analytics/dashboard', [App\Http\Controllers\Admin\AnalyticsController::class, 'dashboard']);
    Route::get('/admin/analytics/export', [App\Http\Controllers\Admin\AnalyticsController::class, 'export']);
    
    // Admin settings routes
    Route::get('/admin/settings', [App\Http\Controllers\Admin\SettingsController::class, 'index']);
    Route::get('/admin/settings/{group}', [App\Http\Controllers\Admin\SettingsController::class, 'show']);
    Route::put('/admin/settings/{group}', [App\Http\Controllers\Admin\SettingsController::class, 'update']);
    Route::post('/admin/settings/password', [App\Http\Controllers\Admin\SettingsController::class, 'updatePassword']);
    
    // Admin delivery personnel routes
    Route::get('/admin/delivery-personnel', [App\Http\Controllers\Admin\DeliveryPersonnelController::class, 'index']);
    Route::post('/admin/delivery-personnel', [App\Http\Controllers\Admin\DeliveryPersonnelController::class, 'store']);
    Route::get('/admin/delivery-personnel/{deliveryPerson}', [App\Http\Controllers\Admin\DeliveryPersonnelController::class, 'show']);
    Route::put('/admin/delivery-personnel/{deliveryPerson}', [App\Http\Controllers\Admin\DeliveryPersonnelController::class, 'update']);
    Route::delete('/admin/delivery-personnel/{deliveryPerson}', [App\Http\Controllers\Admin\DeliveryPersonnelController::class, 'destroy']);
    Route::get('/admin/delivery-personnel/active/list', [App\Http\Controllers\Admin\DeliveryPersonnelController::class, 'getActivePersonnel']);
    Route::post('/admin/delivery-personnel/{deliveryPerson}/assign-order', [App\Http\Controllers\Admin\DeliveryPersonnelController::class, 'assignOrder']);
    Route::post('/admin/delivery-personnel/{deliveryPerson}/test-telegram', [App\Http\Controllers\Admin\DeliveryPersonnelController::class, 'testTelegram']);
    Route::post('/admin/delivery-personnel/{deliveryPerson}/get-chat-id', [App\Http\Controllers\Admin\DeliveryPersonnelController::class, 'getChatId']);
    Route::post('/admin/delivery-personnel/{deliveryPerson}/update-chat-id', [App\Http\Controllers\Admin\DeliveryPersonnelController::class, 'updateChatId']);
    Route::get('/admin/delivery/stats', [App\Http\Controllers\Admin\DeliveryPersonnelController::class, 'getStats']);
    
    // Admin delivery notification routes
    Route::get('/admin/delivery-notifications', [App\Http\Controllers\Admin\DeliveryNotificationController::class, 'index']);
    Route::post('/admin/delivery-notifications/send', [App\Http\Controllers\Admin\DeliveryNotificationController::class, 'sendNotification']);
    Route::post('/admin/delivery-notifications/respond', [App\Http\Controllers\Admin\DeliveryNotificationController::class, 'handleResponse']);
    Route::get('/admin/delivery-notifications/stats', [App\Http\Controllers\Admin\DeliveryNotificationController::class, 'getStats']);
    
    // Admin promo code routes
    Route::get('/admin/promo-codes', [App\Http\Controllers\Admin\PromoCodeController::class, 'index']);
    Route::post('/admin/promo-codes', [App\Http\Controllers\Admin\PromoCodeController::class, 'store']);
    Route::get('/admin/promo-codes/{promoCode}', [App\Http\Controllers\Admin\PromoCodeController::class, 'show']);
    Route::put('/admin/promo-codes/{promoCode}', [App\Http\Controllers\Admin\PromoCodeController::class, 'update']);
    Route::delete('/admin/promo-codes/{promoCode}', [App\Http\Controllers\Admin\PromoCodeController::class, 'destroy']);
    Route::post('/admin/promo-codes/generate-code', [App\Http\Controllers\Admin\PromoCodeController::class, 'generateCode']);
    Route::get('/admin/promo-codes-stats', [App\Http\Controllers\Admin\PromoCodeController::class, 'getStats']);
    Route::post('/admin/promo-codes/{promoCode}/toggle-status', [App\Http\Controllers\Admin\PromoCodeController::class, 'toggleStatus']);
    
    // Admin tag routes
    Route::get('/admin/tags', [App\Http\Controllers\Admin\TagController::class, 'index']);
    Route::post('/admin/tags', [App\Http\Controllers\Admin\TagController::class, 'store']);
    Route::get('/admin/tags/{tag}', [App\Http\Controllers\Admin\TagController::class, 'show']);
    Route::put('/admin/tags/{tag}', [App\Http\Controllers\Admin\TagController::class, 'update']);
    Route::delete('/admin/tags/{tag}', [App\Http\Controllers\Admin\TagController::class, 'destroy']);
    Route::get('/admin/tags/for-products/list', [App\Http\Controllers\Admin\TagController::class, 'forProducts']);
    Route::post('/admin/tags/bulk-update-status', [App\Http\Controllers\Admin\TagController::class, 'bulkUpdateStatus']);
    
    // Admin platform settings routes
    Route::get('/admin/platform-settings', [App\Http\Controllers\Admin\PlatformSettingController::class, 'index']);
    Route::get('/admin/platform-settings/group/{group}', [App\Http\Controllers\Admin\PlatformSettingController::class, 'getByGroup']);
    Route::put('/admin/platform-settings/batch', [App\Http\Controllers\Admin\PlatformSettingController::class, 'updateBatch']);
    Route::put('/admin/platform-settings/{key}', [App\Http\Controllers\Admin\PlatformSettingController::class, 'update']);
    
    // File upload routes
    Route::post('/admin/upload', [App\Http\Controllers\Admin\FileUploadController::class, 'upload']);
    Route::delete('/admin/upload', [App\Http\Controllers\Admin\FileUploadController::class, 'delete']);
    
    // Admin banner routes
    Route::get('/admin/banners', [App\Http\Controllers\Admin\BannerController::class, 'index']);
    Route::post('/admin/banners', [App\Http\Controllers\Admin\BannerController::class, 'store']);
    Route::get('/admin/banners/{id}', [App\Http\Controllers\Admin\BannerController::class, 'show']);
    Route::put('/admin/banners/{id}', [App\Http\Controllers\Admin\BannerController::class, 'update']);
    Route::delete('/admin/banners/{id}', [App\Http\Controllers\Admin\BannerController::class, 'destroy']);
    Route::post('/admin/banners/{id}/toggle-status', [App\Http\Controllers\Admin\BannerController::class, 'toggleStatus']);
    Route::post('/admin/banners/update-sort-order', [App\Http\Controllers\Admin\BannerController::class, 'updateSortOrder']);
    
    // Admin home section routes
    Route::get('/admin/home-sections', [App\Http\Controllers\Admin\HomeSectionController::class, 'index']);
    Route::post('/admin/home-sections', [App\Http\Controllers\Admin\HomeSectionController::class, 'store']);
    Route::get('/admin/home-sections/{id}', [App\Http\Controllers\Admin\HomeSectionController::class, 'show']);
    Route::put('/admin/home-sections/{id}', [App\Http\Controllers\Admin\HomeSectionController::class, 'update']);
    Route::delete('/admin/home-sections/{id}', [App\Http\Controllers\Admin\HomeSectionController::class, 'destroy']);
    Route::post('/admin/home-sections/{id}/toggle-status', [App\Http\Controllers\Admin\HomeSectionController::class, 'toggleStatus']);
    Route::post('/admin/home-sections/update-sort-order', [App\Http\Controllers\Admin\HomeSectionController::class, 'updateSortOrder']);
    
    // Admin cart routes
    Route::get('/admin/carts/customer/{userId}', [App\Http\Controllers\Admin\CartController::class, 'getCustomerCart']);
    Route::get('/admin/carts/abandoned', [App\Http\Controllers\Admin\CartController::class, 'getAbandonedCarts']);
    Route::get('/admin/carts/stats', [App\Http\Controllers\Admin\CartController::class, 'getCartStats']);
    
    // Admin customer routes
    Route::get('/admin/customers', [App\Http\Controllers\Admin\CustomerController::class, 'index']);
    Route::get('/admin/customers/{id}', [App\Http\Controllers\Admin\CustomerController::class, 'show']);
    Route::get('/admin/customers/{id}/timeline', [App\Http\Controllers\Admin\CustomerController::class, 'getTimeline']);
    Route::get('/admin/customers/stats', [App\Http\Controllers\Admin\CustomerController::class, 'getStats']);
});

Route::middleware(['auth:sanctum', 'super_admin'])->group(function () {
    Route::get('/super-admin/dashboard', [TenantManagementController::class, 'dashboard']);
    Route::get('/super-admin/tenants', [TenantManagementController::class, 'index']);
    Route::post('/super-admin/tenants', [TenantManagementController::class, 'store']);
    Route::put('/super-admin/tenants/{tenant}', [TenantManagementController::class, 'update']);
    Route::put('/super-admin/tenants/{tenant}/subscription', [TenantManagementController::class, 'updateSubscription']);
    Route::delete('/super-admin/tenants/{tenant}', [TenantManagementController::class, 'destroy']);
});

// Public tag routes (no authentication needed)
Route::get('/tags/featured', function () {
    try {
        $tags = App\Models\Tag::active()
            ->featured()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tags
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching featured tags: ' . $e->getMessage(),
            'data' => []
        ], 500);
    }
});

Route::get('/tags', function () {
    try {
        $tags = App\Models\Tag::active()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tags
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching tags: ' . $e->getMessage(),
            'data' => []
        ], 500);
    }
});

Route::get('/tags/type/{type}', function ($type) {
    try {
        $tags = App\Models\Tag::active()
            ->ofType($type)
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tags
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching tags by type: ' . $e->getMessage(),
            'data' => []
        ], 500);
    }
});

// Promo code routes (public - for checkout)
Route::post('/promo-codes/validate', [App\Http\Controllers\PromoCodeController::class, 'validateCode']);
Route::post('/promo-codes/auto-apply', [App\Http\Controllers\PromoCodeController::class, 'getAutoApply']);
Route::post('/promo-codes/remove', [App\Http\Controllers\PromoCodeController::class, 'remove']);

// Telegram webhook (public route - no authentication needed)
Route::post('/telegram/webhook', [App\Http\Controllers\TelegramWebhookController::class, 'handle']);

// Public platform settings (for frontend theming)
Route::get('/platform-settings', [App\Http\Controllers\Admin\PlatformSettingController::class, 'getPublicSettings']);

// Public banner routes
Route::get('/banners', [App\Http\Controllers\BannerController::class, 'index']);
Route::get('/banners/type/{type}', [App\Http\Controllers\BannerController::class, 'getByType']);

// Public home sections routes
Route::get('/home-sections', [App\Http\Controllers\HomeSectionController::class, 'index']);
