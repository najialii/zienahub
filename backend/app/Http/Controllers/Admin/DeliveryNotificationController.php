<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryNotification;
use App\Models\DeliveryPerson;
use App\Models\Order;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeliveryNotificationController extends Controller
{
    /**
     * Send delivery notification to a delivery person
     */
    public function sendNotification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'delivery_person_id' => 'required|exists:delivery_personnel,id',
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
            $order = Order::with('items.product')->findOrFail($request->order_id);
            $deliveryPerson = DeliveryPerson::findOrFail($request->delivery_person_id);

            // Check if order already has a pending notification for this person
            $existingNotification = DeliveryNotification::where('order_id', $order->id)
                ->where('delivery_person_id', $deliveryPerson->id)
                ->where('status', 'pending')
                ->first();

            if ($existingNotification) {
                return response()->json([
                    'success' => false,
                    'message' => 'A pending notification already exists for this order and delivery person'
                ], 400);
            }

            // Check if order is already assigned
            if ($order->delivery_person_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is already assigned to a delivery person'
                ], 400);
            }

            // Create notification record
            $expiresInMinutes = $request->expires_in_minutes ?? 15;
            $notification = DeliveryNotification::create([
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

            return response()->json([
                'success' => true,
                'message' => 'Delivery notification sent successfully',
                'telegram_sent' => $telegramResult !== false,
                'data' => $notification->load(['order', 'deliveryPerson'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to send delivery notification', [
                'order_id' => $request->order_id,
                'delivery_person_id' => $request->delivery_person_id,
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
     * Handle accept/decline response from Telegram
     */
    public function handleResponse(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'notification_id' => 'required|exists:delivery_notifications,id',
            'action' => 'required|in:accept,decline',
            'decline_reason' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $notification = DeliveryNotification::with(['order', 'deliveryPerson'])->findOrFail($request->notification_id);

            // Check if notification is still pending
            if ($notification->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This notification has already been responded to'
                ], 400);
            }

            // Check if notification has expired
            if ($notification->isExpired()) {
                $notification->expire();
                return response()->json([
                    'success' => false,
                    'message' => 'This notification has expired'
                ], 400);
            }

            if ($request->action === 'accept') {
                // Accept the order
                $notification->accept();
                
                // Assign the order to the delivery person
                $notification->order->update([
                    'delivery_person_id' => $notification->delivery_person_id,
                    'assigned_at' => now(),
                    'status' => 'assigned'
                ]);

                // Decline any other pending notifications for this order
                DeliveryNotification::where('order_id', $notification->order_id)
                    ->where('id', '!=', $notification->id)
                    ->where('status', 'pending')
                    ->update(['status' => 'expired']);

                $message = "Order {$notification->order->order_number} has been accepted and assigned to {$notification->deliveryPerson->name}";
                
            } else {
                // Decline the order
                $notification->decline($request->decline_reason);
                $message = "Order {$notification->order->order_number} has been declined by {$notification->deliveryPerson->name}";
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $notification->fresh(['order', 'deliveryPerson'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to handle delivery response', [
                'notification_id' => $request->notification_id,
                'action' => $request->action,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process response',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get delivery notifications
     */
    public function index(Request $request)
    {
        $query = DeliveryNotification::with(['order', 'deliveryPerson']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by delivery person
        if ($request->has('delivery_person_id')) {
            $query->where('delivery_person_id', $request->delivery_person_id);
        }

        // Filter by order
        if ($request->has('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        $notifications = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Get notification statistics
     */
    public function getStats()
    {
        $stats = [
            'total_notifications' => DeliveryNotification::count(),
            'pending_notifications' => DeliveryNotification::pending()->count(),
            'accepted_notifications' => DeliveryNotification::accepted()->count(),
            'declined_notifications' => DeliveryNotification::declined()->count(),
            'expired_notifications' => DeliveryNotification::expired()->count(),
            'response_rate' => 0
        ];

        $totalResponded = $stats['accepted_notifications'] + $stats['declined_notifications'];
        if ($stats['total_notifications'] > 0) {
            $stats['response_rate'] = round(($totalResponded / $stats['total_notifications']) * 100, 2);
        }

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}