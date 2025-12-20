<?php

namespace App\Http\Controllers;

use App\Models\DeliveryNotification;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $update = $request->all();
        
        Log::info('Telegram webhook received', $update);
        
        // Handle regular messages (like /start)
        if (isset($update['message'])) {
            $this->handleMessage($update['message']);
        }
        
        // Handle callback queries (button clicks)
        if (isset($update['callback_query'])) {
            return $this->handleCallbackQuery($update['callback_query']);
        }
        
        return response()->json(['ok' => true]);
    }
    
    private function handleCallbackQuery($callbackQuery)
    {
        $data = $callbackQuery['data'];
        $messageId = $callbackQuery['message']['message_id'];
        $chatId = $callbackQuery['from']['id'];
        
        // Parse callback data (format: "accept_123" or "decline_123")
        if (preg_match('/^(accept|decline)_(\d+)$/', $data, $matches)) {
            $action = $matches[1];
            $notificationId = $matches[2];
            
            $notification = DeliveryNotification::with(['order', 'deliveryPerson'])->find($notificationId);
            
            if (!$notification) {
                $this->answerCallbackQuery($callbackQuery['id'], 'إشعار غير موجود');
                return response()->json(['ok' => true]);
            }
            
            // Verify the chat ID matches the delivery person
            if ($notification->deliveryPerson->telegram_chat_id != $chatId) {
                $this->answerCallbackQuery($callbackQuery['id'], 'غير مصرح لك بهذا الإجراء');
                return response()->json(['ok' => true]);
            }
            
            // Check if already responded
            if ($notification->status !== 'pending') {
                $this->answerCallbackQuery($callbackQuery['id'], 'تم الرد على هذا الطلب مسبقاً');
                return response()->json(['ok' => true]);
            }
            
            // Check if expired
            if ($notification->isExpired()) {
                $notification->expire();
                $this->answerCallbackQuery($callbackQuery['id'], 'انتهت صلاحية هذا الطلب');
                return response()->json(['ok' => true]);
            }
            
            if ($action === 'accept') {
                // Accept the order
                $notification->accept();
                
                // Assign order to delivery person
                $notification->order->update([
                    'delivery_person_id' => $notification->delivery_person_id,
                    'assigned_at' => now(),
                    'status' => 'processing'
                ]);
                
                // Decline other pending notifications for this order
                DeliveryNotification::where('order_id', $notification->order_id)
                    ->where('id', '!=', $notification->id)
                    ->where('status', 'pending')
                    ->update(['status' => 'expired']);
                
                $responseText = "✅ تم قبول الطلب بنجاح!";
                
                // Edit the original message to show it's accepted
                $this->editMessage($chatId, $messageId, "✅ <b>تم قبول الطلب</b>\n\nرقم الطلب: <code>{$notification->order->order_number}</code>\nالحالة: تم التعيين لك");
                
                // Send detailed confirmation message
                $confirmationMessage = "🎉 <b>تم قبول الطلب بنجاح!</b>\n\n" .
                                     "📦 رقم الطلب: <code>{$notification->order->order_number}</code>\n" .
                                     "💰 المبلغ: {$notification->order->total_amount} ريال\n" .
                                     "👤 العميل: {$notification->order->shipping_name}\n" .
                                     "📞 هاتف العميل: {$notification->order->shipping_phone}\n\n" .
                                     "📍 عنوان التوصيل:\n{$notification->order->shipping_address}\n" .
                                     "{$notification->order->shipping_city}\n\n" .
                                     "✅ <b>تم تعيين الطلب لك</b>\n" .
                                     "🚚 يرجى التواصل مع العميل لترتيب التوصيل\n\n" .
                                     "📱 يمكنك الاتصال بالعميل الآن!";
                
                $this->sendMessage($chatId, $confirmationMessage);
                
            } else {
                // Decline the order
                $notification->decline('تم الرفض من قبل المندوب');
                
                $responseText = "❌ تم رفض الطلب";
                
                // Edit the original message to show it's declined
                $this->editMessage($chatId, $messageId, "❌ <b>تم رفض الطلب</b>\n\nرقم الطلب: <code>{$notification->order->order_number}</code>\nالحالة: مرفوض");
                
                // Send decline confirmation
                $declineMessage = "❌ <b>تم رفض الطلب</b>\n\n" .
                                "📦 رقم الطلب: <code>{$notification->order->order_number}</code>\n" .
                                "📝 تم تسجيل رفضك للطلب\n\n" .
                                "✅ شكراً لك على الرد السريع";
                
                $this->sendMessage($chatId, $declineMessage);
            }
            
            $this->answerCallbackQuery($callbackQuery['id'], $responseText);
        }
        
        return response()->json(['ok' => true]);
    }
    
    private function answerCallbackQuery($callbackQueryId, $text)
    {
        $telegramService = new TelegramService();
        $telegramService->answerCallbackQuery($callbackQueryId, $text);
    }
    
    private function editMessage($chatId, $messageId, $text)
    {
        $telegramService = new TelegramService();
        $telegramService->editMessage($chatId, $messageId, $text);
    }
    
    private function sendMessage($chatId, $text)
    {
        $telegramService = new TelegramService();
        $telegramService->sendMessage($chatId, $text);
    }
    
    private function handleMessage($message)
    {
        $chatId = $message['chat']['id'];
        $text = $message['text'] ?? '';
        $firstName = $message['from']['first_name'] ?? '';
        $username = $message['from']['username'] ?? null;
        
        // Handle /start command
        if ($text === '/start') {
            $this->handleStartCommand($chatId, $firstName, $username);
        }
    }
    
    private function handleStartCommand($chatId, $firstName, $username)
    {
        // Check if this chat ID already exists
        $existingPerson = \App\Models\DeliveryPerson::where('telegram_chat_id', $chatId)->first();
        
        if ($existingPerson) {
            // Update existing person's info
            $existingPerson->update([
                'telegram_username' => $username ? "@{$username}" : null
            ]);
            
            $welcomeMessage = "مرحباً {$firstName}! 👋\n\n" .
                            "أنت مسجل بالفعل في نظام بلوم كارت للتوصيل.\n" .
                            "ستصلك إشعارات الطلبات هنا. 📦\n\n" .
                            "✅ تم تحديث معلوماتك بنجاح";
        } else {
            // Check if there's a delivery person without chat ID that matches the name
            $personByName = \App\Models\DeliveryPerson::whereNull('telegram_chat_id')
                ->where('name', 'LIKE', "%{$firstName}%")
                ->first();
            
            if ($personByName) {
                // Update the person with chat ID
                $personByName->update([
                    'telegram_chat_id' => $chatId,
                    'telegram_username' => $username ? "@{$username}" : null
                ]);
                
                $welcomeMessage = "مرحباً {$firstName}! 🎉\n\n" .
                                "تم ربط حسابك بنظام بلوم كارت للتوصيل بنجاح!\n" .
                                "ستصلك إشعارات الطلبات هنا. 📦\n\n" .
                                "✅ أنت الآن جاهز لاستقبال طلبات التوصيل";
            } else {
                // New person - create a record for admin to review
                \App\Models\DeliveryPerson::create([
                    'name' => $firstName,
                    'phone' => 'غير محدد - يحتاج تحديث',
                    'telegram_chat_id' => $chatId,
                    'telegram_username' => $username ? "@{$username}" : null,
                    'is_active' => false, // Inactive until admin approves
                    'notes' => 'تم التسجيل تلقائياً عبر تليجرام - يحتاج مراجعة الإدارة'
                ]);
                
                $welcomeMessage = "مرحباً {$firstName}! 👋\n\n" .
                                "شكراً لك على التواصل مع بوت بلوم كارت للتوصيل.\n\n" .
                                "تم تسجيل معلوماتك وسيتم مراجعتها من قبل الإدارة.\n" .
                                "ستصلك رسالة تأكيد عند الموافقة على انضمامك للفريق. ⏳\n\n" .
                                "📞 للاستفسار: تواصل مع الإدارة";
            }
        }
        
        $telegramService = new TelegramService();
        $telegramService->sendMessage($chatId, $welcomeMessage);
    }
}   