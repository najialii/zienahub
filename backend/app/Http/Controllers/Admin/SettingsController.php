<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    /**
     * Get all settings grouped by category
     */
    public function index()
    {
        $settings = Setting::all()->groupBy('group');
        
        $result = [];
        foreach ($settings as $group => $items) {
            $result[$group] = [];
            foreach ($items as $item) {
                $result[$group][$item->key] = $this->castValue($item->value);
            }
        }
        
        // Return with defaults if empty
        return response()->json([
            'general' => array_merge($this->getDefaultGeneral(), $result['general'] ?? []),
            'payment' => array_merge($this->getDefaultPayment(), $result['payment'] ?? []),
            'shipping' => array_merge($this->getDefaultShipping(), $result['shipping'] ?? []),
            'notifications' => array_merge($this->getDefaultNotifications(), $result['notifications'] ?? []),
        ]);
    }

    /**
     * Get settings by group
     */
    public function show(string $group)
    {
        $settings = Setting::where('group', $group)->get();
        
        $result = [];
        foreach ($settings as $item) {
            $result[$item->key] = $this->castValue($item->value);
        }
        
        // Merge with defaults
        $defaults = match($group) {
            'general' => $this->getDefaultGeneral(),
            'payment' => $this->getDefaultPayment(),
            'shipping' => $this->getDefaultShipping(),
            'notifications' => $this->getDefaultNotifications(),
            default => []
        };
        
        return response()->json(array_merge($defaults, $result));
    }

    /**
     * Update settings for a group
     */
    public function update(Request $request, string $group)
    {
        $data = $request->all();
        
        foreach ($data as $key => $value) {
            Setting::set($key, is_bool($value) ? ($value ? '1' : '0') : $value, $group);
        }
        
        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $this->show($group)->original
        ]);
    }

    /**
     * Update admin password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }

    /**
     * Cast string values to appropriate types
     */
    private function castValue($value)
    {
        if ($value === '1' || $value === 'true') return true;
        if ($value === '0' || $value === 'false') return false;
        if (is_numeric($value)) return strpos($value, '.') !== false ? (float)$value : (int)$value;
        return $value;
    }

    private function getDefaultGeneral(): array
    {
        return [
            'store_name' => 'BloomCart',
            'store_email' => 'info@bloomcart.com',
            'store_phone' => '+966 50 123 4567',
            'currency' => 'SAR',
            'language' => 'en',
        ];
    }

    private function getDefaultPayment(): array
    {
        return [
            'credit_card_enabled' => true,
            'mada_enabled' => true,
            'cod_enabled' => true,
        ];
    }

    private function getDefaultShipping(): array
    {
        return [
            'standard_shipping_fee' => 25,
            'express_shipping_fee' => 50,
            'free_shipping_threshold' => 500,
            'estimated_delivery' => '2-5 business days',
        ];
    }

    private function getDefaultNotifications(): array
    {
        return [
            'order_notifications' => true,
            'low_stock_alerts' => true,
            'customer_messages' => true,
        ];
    }
}
