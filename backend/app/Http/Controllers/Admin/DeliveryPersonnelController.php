<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryPerson;
use App\Models\Order;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeliveryPersonnelController extends Controller
{

    /**
     * Display a listing of delivery personnel.
     */
    public function index()
    {
        $personnel = DeliveryPerson::withCount(['orders as pending_orders_count' => function ($query) {
            $query->whereIn('status', ['pending', 'processing', 'assigned']);
        }])->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $personnel
        ]);
    }

    /**
     * Store a newly created delivery person.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'telegram_chat_id' => 'nullable|string|max:255',
            'telegram_username' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $deliveryPerson = DeliveryPerson::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Delivery person created successfully',
            'data' => $deliveryPerson
        ], 201);
    }
    /**
     * Display the specified delivery person.
     */
    public function show(DeliveryPerson $deliveryPerson)
    {
        $deliveryPerson->load(['orders' => function ($query) {
            $query->latest()->take(10);
        }]);

        return response()->json([
            'success' => true,
            'data' => $deliveryPerson
        ]);
    }

    /**
     * Update the specified delivery person.
     */
    public function update(Request $request, DeliveryPerson $deliveryPerson)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'telegram_chat_id' => 'nullable|string|max:255',
            'telegram_username' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $deliveryPerson->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Delivery person updated successfully',
            'data' => $deliveryPerson
        ]);
    }

    /**
     * Remove the specified delivery person.
     */
    public function destroy(DeliveryPerson $deliveryPerson)
    {
        // Check if delivery person has pending orders
        $pendingOrders = $deliveryPerson->orders()->whereIn('status', ['pending', 'processing', 'assigned'])->count();
        
        if ($pendingOrders > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete delivery person with pending orders'
            ], 400);
        }

        $deliveryPerson->delete();

        return response()->json([
            'success' => true,
            'message' => 'Delivery person deleted successfully'
        ]);
    }

    /**
     * Assign an order to a delivery person.
     */
    public function assignOrder(Request $request, DeliveryPerson $deliveryPerson)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'delivery_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::findOrFail($request->order_id);

        // Check if order is already assigned
        if ($order->delivery_person_id) {
            return response()->json([
                'success' => false,
                'message' => 'Order is already assigned to a delivery person'
            ], 400);
        }

        // Update order
        $order->update([
            'delivery_person_id' => $deliveryPerson->id,
            'assigned_at' => now(),
            'status' => 'assigned',
            'delivery_notes' => $request->delivery_notes
        ]);

        // Send Telegram notification
        $telegramService = new TelegramService();
        $telegramResult = $telegramService->sendOrderAssignment($deliveryPerson, $order);

        return response()->json([
            'success' => true,
            'message' => 'Order assigned successfully',
            'telegram_sent' => $telegramResult !== false,
            'data' => $order->load('deliveryPerson')
        ]);
    }

    /**
     * Get active delivery personnel for assignment.
     */
    public function getActivePersonnel()
    {
        $personnel = DeliveryPerson::active()
            ->withCount(['orders as pending_orders_count' => function ($query) {
                $query->whereIn('status', ['pending', 'processing', 'assigned']);
            }])
            ->orderBy('pending_orders_count')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $personnel
        ]);
    }

    /**
     * Test Telegram connection for a delivery person.
     */
    public function testTelegram(DeliveryPerson $deliveryPerson)
    {
        if (!$deliveryPerson->telegram_chat_id) {
            return response()->json([
                'success' => false,
                'message' => 'No Telegram chat ID configured for this delivery person'
            ], 400);
        }

        $testMessage = "🤖 <b>Test Message</b>\n\n" .
                      "Hello {$deliveryPerson->name}!\n\n" .
                      "This is a test message from Zeina delivery system.\n" .
                      "If you receive this, your Telegram integration is working correctly! ✅\n\n" .
                      "Time: " . now()->format('Y-m-d H:i:s');

        $telegramService = new TelegramService();
        $result = $telegramService->sendMessage($deliveryPerson->telegram_chat_id, $testMessage);

        return response()->json([
            'success' => $result !== false,
            'message' => $result !== false 
                ? 'Test message sent successfully' 
                : 'Failed to send test message'
        ]);
    }

    /**
     * Get chat ID from recent Telegram messages.
     */
    public function getChatId(DeliveryPerson $deliveryPerson)
    {
        $telegramService = new TelegramService();
        
        try {
            // Get recent updates from Telegram
            $updates = $telegramService->getUpdates();
            
            if (!$updates || !isset($updates['result'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to get Telegram updates'
                ], 500);
            }
            
            // Look for messages from someone with matching name
            foreach ($updates['result'] as $update) {
                if (isset($update['message'])) {
                    $message = $update['message'];
                    $firstName = $message['from']['first_name'] ?? '';
                    $username = $message['from']['username'] ?? null;
                    $chatId = $message['from']['id'];
                    
                    // Check if name matches (case insensitive, partial match)
                    if (stripos($firstName, $deliveryPerson->name) !== false || 
                        stripos($deliveryPerson->name, $firstName) !== false) {
                        
                        return response()->json([
                            'success' => true,
                            'chat_id' => (string) $chatId,
                            'username' => $username ? "@{$username}" : null,
                            'first_name' => $firstName,
                            'message' => "Found chat ID for {$firstName}"
                        ]);
                    }
                }
            }
            
            return response()->json([
                'success' => false,
                'message' => "No matching chat ID found for {$deliveryPerson->name}. Ask them to send /start to the bot first."
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error getting chat ID: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update only the chat ID for a delivery person.
     */
    public function updateChatId(Request $request, DeliveryPerson $deliveryPerson)
    {
        $validator = Validator::make($request->all(), [
            'telegram_chat_id' => 'required|string|max:255',
            'telegram_username' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $deliveryPerson->update([
            'telegram_chat_id' => $request->telegram_chat_id,
            'telegram_username' => $request->telegram_username
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chat ID updated successfully',
            'data' => $deliveryPerson
        ]);
    }

    /**
     * Get delivery statistics.
     */
    public function getStats()
    {
        $stats = [
            'total_personnel' => DeliveryPerson::count(),
            'active_personnel' => DeliveryPerson::active()->count(),
            'assigned_orders' => Order::whereNotNull('delivery_person_id')
                ->whereIn('status', ['assigned', 'shipped'])
                ->count(),
            'delivered_today' => Order::whereDate('delivered_at', today())->count(),
            'pending_assignments' => Order::whereNull('delivery_person_id')
                ->whereIn('status', ['pending', 'processing'])
                ->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}