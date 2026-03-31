<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\DeliveryPerson;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        // Manually authenticate if token is present (for optional auth)
        if ($request->bearerToken()) {
            try {
                $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
                if ($token) {
                    auth()->setUser($token->tokenable);
                    \Log::info('Token authenticated successfully', ['user_id' => $token->tokenable->id]);
                }
            } catch (\Exception $e) {
                \Log::error('Token authentication failed', ['error' => $e->getMessage()]);
            }
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'shipping_name' => 'required|string|max:255',
            'shipping_email' => 'required|email|max:255',
            'shipping_phone' => 'required|string|max:255',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string|max:255',
            'shipping_postal_code' => 'required|string|max:255',
            'shipping_country' => 'required|string|max:255',
            // Gift box fields (optional)
            'gift_box_id' => 'nullable|exists:gift_boxes,id',
            'is_gift' => 'nullable|boolean',
            'recipient_name' => 'nullable|string|max:255',
            'recipient_phone' => 'nullable|string|max:255',
            'recipient_address' => 'nullable|string',
            'gift_message' => 'nullable|string',
            'sender_name' => 'nullable|string|max:255',
            // Promo code fields
            'promo_code' => 'nullable|string|max:50',
            'discount_amount' => 'nullable|numeric|min:0',
            'subtotal' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Debug authentication
            \Log::info('Order creation - Auth check:', [
                'is_authenticated' => auth()->check(),
                'user_id' => auth()->check() ? auth()->id() : null,
                'user' => auth()->user() ? auth()->user()->toArray() : null,
            ]);

            // Handle promo code validation
            $promoCodeId = null;
            $discountAmount = 0;
            $subtotalAmount = $request->subtotal ?? $request->total;

            if ($request->promo_code) {
                $promoCode = \App\Models\PromoCode::where('code', strtoupper($request->promo_code))->first();
                
                if ($promoCode && $promoCode->isValid() && $promoCode->canBeUsedBy(auth()->id(), $request->shipping_email)) {
                    $calculatedDiscount = $promoCode->calculateDiscount($subtotalAmount, $request->items);
                    
                    if ($calculatedDiscount > 0) {
                        $promoCodeId = $promoCode->id;
                        $discountAmount = $calculatedDiscount;
                    }
                }
            }

            // Create order (support both authenticated and guest users)
            $order = Order::create([
                'user_id' => auth()->check() ? auth()->id() : null,
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'total_amount' => $request->total,
                'subtotal_amount' => $subtotalAmount,
                'discount_amount' => $discountAmount,
                'promo_code_id' => $promoCodeId,
                'promo_code' => $request->promo_code ? strtoupper($request->promo_code) : null,
                'status' => 'pending',
                'shipping_name' => $request->shipping_name,
                'shipping_email' => $request->shipping_email,
                'shipping_phone' => $request->shipping_phone,
                'shipping_address' => $request->shipping_address,
                'shipping_city' => $request->shipping_city,
                'shipping_postal_code' => $request->shipping_postal_code,
                'shipping_country' => $request->shipping_country,
                // Gift fields
                'gift_box_id' => $request->gift_box_id,
                'is_gift' => $request->is_gift ?? false,
                'recipient_name' => $request->recipient_name,
                'recipient_phone' => $request->recipient_phone,
                'recipient_address' => $request->recipient_address,
                'gift_message' => $request->gift_message,
                'sender_name' => $request->sender_name,
            ]);

            // Create order items
            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price_at_purchase' => $item['price'],
                ]);
            }

            // Record promo code usage if applicable
            if ($promoCodeId && $discountAmount > 0) {
                $promoCode = \App\Models\PromoCode::find($promoCodeId);
                $promoCode->use($order->id, auth()->id(), $request->shipping_email, $discountAmount);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('items.product')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $query = Order::with(['items.product', 'deliveryPerson']);

        // Non-admin users only see their own orders
        if (auth()->check() && !in_array(auth()->user()->role, ['tenant_admin', 'super_admin', 'admin'], true)) {
            $query->where('user_id', auth()->id());
        }

        // Apply filters using scopes
        $query->byStatus($request->status)
              ->search($request->search)
              ->recent();

        // Pagination
        $perPage = $request->per_page ?? 20;
        $orders = $query->paginate($perPage);

        return response()->json($orders);
    }

    public function show($id)
    {
        // Manually authenticate if token is present
        if (request()->bearerToken()) {
            try {
                $token = \Laravel\Sanctum\PersonalAccessToken::findToken(request()->bearerToken());
                if ($token) {
                    auth()->setUser($token->tokenable);
                }
            } catch (\Exception $e) {
                // Continue without auth
            }
        }

        // Try to find by ID first, then by order_number
        $order = Order::with('items.product')->where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        // Check authorization
        if (auth()->check() && !in_array(auth()->user()->role, ['tenant_admin', 'super_admin', 'admin'], true) && $order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string|max:255',
            'tracking_carrier' => 'nullable|string|max:255',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $order = Order::findOrFail($id);
            
            $oldStatus = $order->status;
            $order->status = $request->status;
            $order->status_updated_at = now();
            
            // Update tracking info if provided
            if ($request->has('tracking_number')) {
                $order->tracking_number = $request->tracking_number;
            }
            if ($request->has('tracking_carrier')) {
                $order->tracking_carrier = $request->tracking_carrier;
            }
            if ($request->has('admin_notes')) {
                $order->admin_notes = $request->admin_notes;
            }
            
            $order->save();

            \Log::info('Order status updated', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'old_status' => $oldStatus,
                'new_status' => $order->status,
                'tracking_number' => $order->tracking_number,
                'updated_by' => auth()->user()->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => $order->load('items.product')
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to update order status', [
                'order_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|integer|exists:orders,id',
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string|max:255',
            'tracking_carrier' => 'nullable|string|max:255',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $orderIds = $request->order_ids;
            $updateData = [
                'status' => $request->status,
                'status_updated_at' => now(),
            ];

            // Add optional fields if provided
            if ($request->has('tracking_number')) {
                $updateData['tracking_number'] = $request->tracking_number;
            }
            if ($request->has('tracking_carrier')) {
                $updateData['tracking_carrier'] = $request->tracking_carrier;
            }
            if ($request->has('admin_notes')) {
                $updateData['admin_notes'] = $request->admin_notes;
            }

            // Bulk update using Eloquent ORM
            $updatedCount = Order::whereIn('id', $orderIds)->update($updateData);

            // Get updated orders for logging
            $orders = Order::whereIn('id', $orderIds)->get();

            \Log::info('Bulk order status update', [
                'order_count' => $updatedCount,
                'order_ids' => $orderIds,
                'new_status' => $request->status,
                'tracking_number' => $request->tracking_number ?? null,
                'updated_by' => auth()->user()->email,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully updated {$updatedCount} order(s)",
                'data' => [
                    'updated_count' => $updatedCount,
                    'orders' => $orders
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('Failed to bulk update order status', [
                'order_ids' => $request->order_ids ?? [],
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send delivery notification to a delivery person
     */
    public function notifyDelivery(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'delivery_person_id' => 'required|exists:delivery_personnel,id',
            'delivery_notes' => 'nullable|string',
            'delivery_latitude' => 'nullable|numeric|between:-90,90',
            'delivery_longitude' => 'nullable|numeric|between:-180,180',
            'expires_in_minutes' => 'nullable|integer|min:5|max:60'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $order = Order::with('items.product')->findOrFail($id);
            $deliveryPerson = DeliveryPerson::findOrFail($request->delivery_person_id);

            // Check if order is already assigned
            if ($order->delivery_person_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is already assigned to a delivery person'
                ], 400);
            }

            // Update order with delivery location if provided
            if ($request->delivery_latitude && $request->delivery_longitude) {
                $order->update([
                    'delivery_latitude' => $request->delivery_latitude,
                    'delivery_longitude' => $request->delivery_longitude,
                    'delivery_notes' => $request->delivery_notes
                ]);
            }

            // Create notification record
            $expiresInMinutes = $request->expires_in_minutes ?? 15;
            $notification = \App\Models\DeliveryNotification::create([
                'order_id' => $order->id,
                'delivery_person_id' => $deliveryPerson->id,
                'status' => 'pending',
                'sent_at' => now(),
                'expires_at' => now()->addMinutes($expiresInMinutes)
            ]);

            // Send Telegram notification with accept/decline buttons
            $telegramService = new TelegramService();
            $telegramResult = $telegramService->sendOrderNotification($deliveryPerson, $order, $notification->id);

            if ($telegramResult && isset($telegramResult['result']['message_id'])) {
                $notification->update([
                    'telegram_message_id' => $telegramResult['result']['message_id']
                ]);
            }

            \Log::info('Delivery notification sent', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'delivery_person_id' => $deliveryPerson->id,
                'delivery_person_name' => $deliveryPerson->name,
                'notification_id' => $notification->id,
                'telegram_sent' => $telegramResult !== false,
                'sent_by' => auth()->user()->email ?? 'system'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Delivery notification sent successfully. Waiting for response.',
                'telegram_sent' => $telegramResult !== false,
                'data' => [
                    'notification' => $notification,
                    'order' => $order->load('deliveryPerson'),
                    'expires_at' => $notification->expires_at
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to send delivery notification', [
                'order_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send delivery notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark order as delivered
     */
    public function markDelivered(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'delivery_notes' => 'nullable|string',
            'delivered_at' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $order = Order::with('deliveryPerson')->findOrFail($id);

            $order->update([
                'status' => 'delivered',
                'delivered_at' => $request->delivered_at ?? now(),
                'delivery_notes' => $request->delivery_notes
            ]);

            // Send status update to delivery person if assigned
            if ($order->deliveryPerson) {
                $telegramService = new TelegramService();
                $telegramService->sendStatusUpdate($order->deliveryPerson, $order, 'delivered');
            }

            \Log::info('Order marked as delivered', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'delivered_at' => $order->delivered_at,
                'updated_by' => auth()->user()->email ?? 'system'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order marked as delivered successfully',
                'data' => $order->load('deliveryPerson')
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to mark order as delivered', [
                'order_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark order as delivered',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk send delivery notifications
     */
    public function bulkNotifyDelivery(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'required|integer|exists:orders,id',
            'delivery_person_id' => 'required|exists:delivery_personnel,id',
            'delivery_notes' => 'nullable|string',
            'expires_in_minutes' => 'nullable|integer|min:5|max:60'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $deliveryPerson = DeliveryPerson::findOrFail($request->delivery_person_id);
            $expiresInMinutes = $request->expires_in_minutes ?? 15;
            $successCount = 0;
            $failedOrders = [];
            $notifications = [];

            foreach ($request->order_ids as $orderId) {
                try {
                    $order = Order::with('items.product')->findOrFail($orderId);

                    // Skip if order is already assigned
                    if ($order->delivery_person_id) {
                        $failedOrders[] = [
                            'order_id' => $orderId,
                            'order_number' => $order->order_number,
                            'reason' => 'Already assigned'
                        ];
                        continue;
                    }

                    // Check if there's already a pending notification
                    $existingNotification = \App\Models\DeliveryNotification::where('order_id', $order->id)
                        ->where('delivery_person_id', $deliveryPerson->id)
                        ->where('status', 'pending')
                        ->first();

                    if ($existingNotification) {
                        $failedOrders[] = [
                            'order_id' => $orderId,
                            'order_number' => $order->order_number,
                            'reason' => 'Notification already pending'
                        ];
                        continue;
                    }

                    // Create notification
                    $notification = \App\Models\DeliveryNotification::create([
                        'order_id' => $order->id,
                        'delivery_person_id' => $deliveryPerson->id,
                        'status' => 'pending',
                        'sent_at' => now(),
                        'expires_at' => now()->addMinutes($expiresInMinutes)
                    ]);

                    // Send Telegram notification
                    $telegramService = new TelegramService();
                    $telegramResult = $telegramService->sendOrderNotification($deliveryPerson, $order, $notification->id);

                    if ($telegramResult && isset($telegramResult['result']['message_id'])) {
                        $notification->update([
                            'telegram_message_id' => $telegramResult['result']['message_id']
                        ]);
                    }

                    $notifications[] = $notification;
                    $successCount++;

                } catch (\Exception $e) {
                    $failedOrders[] = [
                        'order_id' => $orderId,
                        'order_number' => $order->order_number ?? "Order {$orderId}",
                        'reason' => $e->getMessage()
                    ];
                }
            }

            \Log::info('Bulk delivery notifications sent', [
                'delivery_person_id' => $deliveryPerson->id,
                'delivery_person_name' => $deliveryPerson->name,
                'success_count' => $successCount,
                'failed_count' => count($failedOrders),
                'sent_by' => auth()->user()->email ?? 'system'
            ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully sent {$successCount} delivery notifications",
                'data' => [
                    'success_count' => $successCount,
                    'failed_count' => count($failedOrders),
                    'failed_orders' => $failedOrders,
                    'notifications' => $notifications
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to send bulk delivery notifications', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to send bulk delivery notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get orders available for delivery assignment
     */
    public function getUnassignedOrders()
    {
        $orders = Order::with(['items.product'])
            ->whereNull('delivery_person_id')
            ->whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
}
