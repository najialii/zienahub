<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PlatformSettingController extends Controller
{
    /**
     * Get all platform settings grouped by category
     */
    public function index(): JsonResponse
    {
        try {
            $settings = PlatformSetting::all()->groupBy('group');
            
            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch platform settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get settings by group
     */
    public function getByGroup(string $group): JsonResponse
    {
        try {
            $settings = PlatformSetting::where('group', $group)->get();
            
            return response()->json([
                'success' => true,
                'data' => $settings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update multiple settings at once
     */
    public function updateBatch(Request $request): JsonResponse
    {
        try {
            $settings = $request->input('settings', []);
            
            // Define which fields can be null/empty (optional fields)
            $optionalFields = ['platform_logo', 'platform_logo_dark'];
            
            foreach ($settings as $key => $value) {
                $setting = PlatformSetting::where('key', $key)->first();
                if (!$setting) {
                    continue;
                }
                
                // For optional fields, allow null/empty values
                if (in_array($key, $optionalFields)) {
                    $setting->update(['value' => $value === '' ? null : $value]);
                } else {
                    // For required fields, skip null/empty values
                    if ($value === null || $value === '') {
                        continue;
                    }
                    $setting->update(['value' => (string) $value]);
                }
            }

            // Clear all cache
            PlatformSetting::clearCache();

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a single setting
     */
    public function update(Request $request, string $key): JsonResponse
    {
        try {
            $value = $request->input('value');
            
            // Skip null or empty values to prevent database constraint violations
            if ($value === null || $value === '') {
                return response()->json([
                    'success' => false,
                    'message' => 'Value cannot be empty'
                ], 400);
            }
            
            $setting = PlatformSetting::where('key', $key)->first();
            
            if (!$setting) {
                return response()->json([
                    'success' => false,
                    'message' => 'Setting not found'
                ], 404);
            }

            $setting->update(['value' => (string) $value]);

            return response()->json([
                'success' => true,
                'message' => 'Setting updated successfully',
                'data' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get public settings (for frontend)
     */
    public function getPublicSettings(): JsonResponse
    {
        try {
            $publicSettings = PlatformSetting::whereIn('group', ['branding', 'theme', 'contact'])
                ->get()
                ->pluck('value', 'key');

            return response()->json([
                'success' => true,
                'data' => $publicSettings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch public settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}