<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    private $botToken;
    private $baseUrl;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token');
        $this->baseUrl = "https://api.telegram.org/bot{$this->botToken}";
    }

    /**
     * Send a message to a Telegram chat
     */
    public function sendMessage($chatId, $message, $parseMode = 'HTML')
    {
        if (!$this->botToken) {
            Log::error('Telegram bot token not configured');
            return false;
        }

        try {
            $response = Http::post("{$this->baseUrl}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => $parseMode,
                'disable_web_page_preview' => true
            ]);

            if ($response->successful()) {
                Log::info("Telegram message sent successfully to chat {$chatId}");
                return $response->json();
            } else {
                Log::error("Failed to send Telegram message: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Telegram service error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send order assignment notification to delivery person
     */
    public function sendOrderAssignment($deliveryPerson, $order)
    {
        if (!$deliveryPerson->telegram_chat_id) {
            Log::warning("Delivery person {$deliveryPerson->name} has no Telegram chat ID");
            return false;
        }

        $message = $this->formatOrderAssignmentMessage($deliveryPerson, $order);
        return $this->sendMessage($deliveryPerson->telegram_chat_id, $message);
    }

    /**
     * Send order notification with accept/decline buttons
     */
    public function sendOrderNotification($deliveryPerson, $order, $notificationId)
    {
        if (!$deliveryPerson->telegram_chat_id) {
            Log::warning("Delivery person {$deliveryPerson->name} has no Telegram chat ID");
            return false;
        }

        $message = $this->formatOrderNotificationMessage($deliveryPerson, $order);
        $keyboard = $this->createAcceptDeclineKeyboard($notificationId);
        
        $result = $this->sendMessageWithKeyboard($deliveryPerson->telegram_chat_id, $message, $keyboard);
        
        // Also send location as a separate message if coordinates are available
        if ($result && $order->delivery_latitude && $order->delivery_longitude) {
            $this->sendLocation($deliveryPerson->telegram_chat_id, $order->delivery_latitude, $order->delivery_longitude, "📍 Delivery Location");
        }
        
        return $result;
    }

    /**
     * Send a message with inline keyboard
     */
    public function sendMessageWithKeyboard($chatId, $message, $keyboard, $parseMode = 'HTML')
    {
        if (!$this->botToken) {
            Log::error('Telegram bot token not configured');
            return false;
        }

        try {
            $response = Http::post("{$this->baseUrl}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => $parseMode,
                'disable_web_page_preview' => true,
                'reply_markup' => json_encode(['inline_keyboard' => $keyboard])
            ]);

            if ($response->successful()) {
                Log::info("Telegram message with keyboard sent successfully to chat {$chatId}");
                return $response->json();
            } else {
                Log::error("Failed to send Telegram message with keyboard: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Telegram service error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create accept/decline inline keyboard
     */
    private function createAcceptDeclineKeyboard($notificationId)
    {
        return [
            [
                [
                    'text' => '✅ قبول الطلب',
                    'callback_data' => "accept_{$notificationId}"
                ],
                [
                    'text' => '❌ رفض الطلب',
                    'callback_data' => "decline_{$notificationId}"
                ]
            ]
        ];
    }

    /**
     * Format the order notification message (for accept/decline)
     */
    private function formatOrderNotificationMessage($deliveryPerson, $order)
    {
        $items = $order->items()->with('product')->get();
        $itemsList = '';
        
        foreach ($items as $item) {
            $itemsList .= "• {$item->product->name} x{$item->quantity} - {$item->price} ريال\n";
        }

        $locationSection = '';
        if ($order->delivery_latitude && $order->delivery_longitude) {
            $googleMapsUrl = "https://maps.google.com/maps?q={$order->delivery_latitude},{$order->delivery_longitude}";
            $locationSection = "🗺️ <b>التنقل:</b>\n" .
                              "📍 <a href=\"{$googleMapsUrl}\">📱 اضغط لفتح خرائط جوجل</a>\n" .
                              "📍 الإحداثيات: {$order->delivery_latitude}, {$order->delivery_longitude}\n\n";
        }

        return "🚚 <b>طلب توصيل جديد - بلوم كارت</b>\n\n" .
               "👋 مرحباً {$deliveryPerson->name}!\n\n" .
               "لديك طلب توصيل جديد. يرجى المراجعة والرد:\n\n" .
               "📦 <b>تفاصيل الطلب:</b>\n" .
               "رقم الطلب: <code>{$order->order_number}</code>\n" .
               "المجموع: <b>{$order->total_amount} ريال</b>\n\n" .
               "📋 <b>المنتجات:</b>\n{$itemsList}\n" .
               "👤 <b>العميل:</b>\n" .
               "الاسم: {$order->shipping_name}\n" .
               "الهاتف: {$order->shipping_phone}\n" .
               "البريد الإلكتروني: {$order->shipping_email}\n\n" .
               "📍 <b>عنوان التوصيل:</b>\n" .
               "{$order->shipping_address}\n" .
               "{$order->shipping_city}, {$order->shipping_postal_code}\n" .
               "{$order->shipping_country}\n\n" .
               $locationSection .
               "⏰ <b>وقت الطلب:</b> " . now()->format('Y-m-d H:i') . "\n\n" .
               "⚠️ <b>يرجى الرد خلال 15 دقيقة</b>\n\n" .
               "اختر ردك أدناه:";
    }

    /**
     * Format the order assignment message (for confirmed assignments)
     */
    private function formatOrderAssignmentMessage($deliveryPerson, $order)
    {
        $items = $order->items()->with('product')->get();
        $itemsList = '';
        
        foreach ($items as $item) {
            $itemsList .= "• {$item->product->name} x{$item->quantity} - {$item->price} SAR\n";
        }

        $locationSection = '';
        if ($order->delivery_latitude && $order->delivery_longitude) {
            $googleMapsUrl = "https://maps.google.com/maps?q={$order->delivery_latitude},{$order->delivery_longitude}";
            $locationSection = "🗺️ <b>Navigation:</b>\n" .
                              "📍 <a href=\"{$googleMapsUrl}\">📱 Click to Open in Google Maps</a>\n" .
                              "📍 Coordinates: {$order->delivery_latitude}, {$order->delivery_longitude}\n\n";
        }

        return "🚚 <b>New Delivery Assignment</b>\n\n" .
               "👋 Hello {$deliveryPerson->name}!\n\n" .
               "📦 <b>Order Details:</b>\n" .
               "Order #: <code>{$order->order_number}</code>\n" .
               "Total: <b>{$order->total_amount} SAR</b>\n\n" .
               "📋 <b>Items:</b>\n{$itemsList}\n" .
               "👤 <b>Customer:</b>\n" .
               "Name: {$order->shipping_name}\n" .
               "Phone: {$order->shipping_phone}\n" .
               "Email: {$order->shipping_email}\n\n" .
               "📍 <b>Delivery Address:</b>\n" .
               "{$order->shipping_address}\n" .
               "{$order->shipping_city}, {$order->shipping_postal_code}\n" .
               "{$order->shipping_country}\n\n" .
               $locationSection .
               "⏰ <b>Assigned:</b> " . now()->format('Y-m-d H:i') . "\n\n" .
               "Please contact the customer to arrange delivery. Good luck! 🎯";
    }

    /**
     * Send order status update to delivery person
     */
    public function sendStatusUpdate($deliveryPerson, $order, $status)
    {
        if (!$deliveryPerson->telegram_chat_id) {
            return false;
        }

        $statusEmoji = [
            'pending' => '⏳',
            'processing' => '🔄',
            'assigned' => '🚚',
            'shipped' => '📦',
            'delivered' => '✅',
            'cancelled' => '❌'
        ];

        $emoji = $statusEmoji[$status] ?? '📋';
        
        $message = "{$emoji} <b>Order Status Update</b>\n\n" .
                   "Order #: <code>{$order->order_number}</code>\n" .
                   "Status: <b>" . ucfirst($status) . "</b>\n" .
                   "Customer: {$order->shipping_name}\n\n" .
                   "Updated: " . now()->format('Y-m-d H:i');

        return $this->sendMessage($deliveryPerson->telegram_chat_id, $message);
    }

    /**
     * Send location as a map pin
     */
    public function sendLocation($chatId, $latitude, $longitude, $title = null)
    {
        if (!$this->botToken) {
            Log::error('Telegram bot token not configured');
            return false;
        }

        try {
            $params = [
                'chat_id' => $chatId,
                'latitude' => (float) $latitude,
                'longitude' => (float) $longitude
            ];

            // Add title as a separate message if provided
            if ($title) {
                $this->sendMessage($chatId, $title);
            }

            $response = Http::post("{$this->baseUrl}/sendLocation", $params);

            if ($response->successful()) {
                Log::info("Telegram location sent successfully to chat {$chatId}");
                return $response->json();
            } else {
                Log::error("Failed to send Telegram location: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Telegram location service error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Answer callback query (for button responses)
     */
    public function answerCallbackQuery($callbackQueryId, $text = null, $showAlert = false)
    {
        if (!$this->botToken) {
            return false;
        }

        try {
            $params = [
                'callback_query_id' => $callbackQueryId,
                'show_alert' => $showAlert
            ];

            if ($text) {
                $params['text'] = $text;
            }

            $response = Http::post("{$this->baseUrl}/answerCallbackQuery", $params);
            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Failed to answer callback query: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Edit message text
     */
    public function editMessage($chatId, $messageId, $text, $parseMode = 'HTML')
    {
        if (!$this->botToken) {
            return false;
        }

        try {
            $response = Http::post("{$this->baseUrl}/editMessageText", [
                'chat_id' => $chatId,
                'message_id' => $messageId,
                'text' => $text,
                'parse_mode' => $parseMode
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Failed to edit message: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Set webhook URL
     */
    public function setWebhook($url)
    {
        if (!$this->botToken) {
            return false;
        }

        try {
            $response = Http::post("{$this->baseUrl}/setWebhook", [
                'url' => $url
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error("Failed to set webhook: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get recent updates from Telegram
     */
    public function getUpdates($limit = 100)
    {
        if (!$this->botToken) {
            return false;
        }

        try {
            $response = Http::get("{$this->baseUrl}/getUpdates", [
                'limit' => $limit
            ]);

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error("Failed to get Telegram updates: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Telegram getUpdates error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Test the bot connection
     */
    public function testConnection()
    {
        if (!$this->botToken) {
            return ['success' => false, 'message' => 'Bot token not configured'];
        }

        try {
            $response = Http::get("{$this->baseUrl}/getMe");
            
            if ($response->successful()) {
                $botInfo = $response->json();
                return [
                    'success' => true,
                    'message' => 'Bot connected successfully',
                    'bot_info' => $botInfo['result']
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to connect to bot: ' . $response->body()
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Connection error: ' . $e->getMessage()
            ];
        }
    }
}