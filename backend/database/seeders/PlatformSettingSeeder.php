<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlatformSetting;

class PlatformSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Branding Settings
            [
                'key' => 'platform_name',
                'value' => 'Zeina',
                'type' => 'string',
                'group' => 'branding',
                'description' => 'Platform name displayed across the site'
            ],
            [
                'key' => 'platform_name_ar',
                'value' => 'zna',
                'type' => 'string',
                'group' => 'branding',
                'description' => 'Platform name in Arabic'
            ],
            [
                'key' => 'platform_tagline',
                'value' => 'Premium Flowers & Gifts Delivery',
                'type' => 'string',
                'group' => 'branding',
                'description' => 'Platform tagline or slogan'
            ],
            [
                'key' => 'platform_tagline_ar',
                'value' => 'توصيل الأزهار والهدايا المميزة',
                'type' => 'string',
                'group' => 'branding',
                'description' => 'Platform tagline in Arabic'
            ],
            [
                'key' => 'platform_logo',
                'value' => '',
                'type' => 'file',
                'group' => 'branding',
                'description' => 'Platform logo (SVG, PNG, JPG)'
            ],
            [
                'key' => 'platform_logo_dark',
                'value' => '',
                'type' => 'file',
                'group' => 'branding',
                'description' => 'Platform logo for dark backgrounds'
            ],
            [
                'key' => 'use_logo_instead_of_text',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'branding',
                'description' => 'Use logo instead of text for branding'
            ],

            // Theme Colors
            [
                'key' => 'primary_color',
                'value' => '#1f2937',
                'type' => 'color',
                'group' => 'theme',
                'description' => 'Primary brand color'
            ],
            [
                'key' => 'secondary_color',
                'value' => '#f59e0b',
                'type' => 'color',
                'group' => 'theme',
                'description' => 'Secondary brand color'
            ],
            [
                'key' => 'accent_color',
                'value' => '#ef4444',
                'type' => 'color',
                'group' => 'theme',
                'description' => 'Accent color for highlights'
            ],
            [
                'key' => 'success_color',
                'value' => '#10b981',
                'type' => 'color',
                'group' => 'theme',
                'description' => 'Success state color'
            ],
            [
                'key' => 'warning_color',
                'value' => '#f59e0b',
                'type' => 'color',
                'group' => 'theme',
                'description' => 'Warning state color'
            ],
            [
                'key' => 'error_color',
                'value' => '#ef4444',
                'type' => 'color',
                'group' => 'theme',
                'description' => 'Error state color'
            ],

            // Layout Settings
            [
                'key' => 'header_background',
                'value' => '#ffffff',
                'type' => 'color',
                'group' => 'theme',
                'description' => 'Header background color'
            ],
            [
                'key' => 'footer_background',
                'value' => '#ffffff',
                'type' => 'color',
                'group' => 'theme',
                'description' => 'Footer background color'
            ],
            [
                'key' => 'body_background',
                'value' => '#f9fafb',
                'type' => 'color',
                'group' => 'theme',
                'description' => 'Main body background color'
            ],

            // Contact Information
            [
                'key' => 'contact_phone',
                'value' => '+966 50 123 4567',
                'type' => 'string',
                'group' => 'contact',
                'description' => 'Primary contact phone number'
            ],
            [
                'key' => 'contact_email',
                'value' => 'info@bloomcart.sa',
                'type' => 'string',
                'group' => 'contact',
                'description' => 'Primary contact email'
            ],
            [
                'key' => 'contact_address',
                'value' => 'Riyadh, Saudi Arabia',
                'type' => 'string',
                'group' => 'contact',
                'description' => 'Business address'
            ],
            [
                'key' => 'contact_address_ar',
                'value' => 'الرياض، المملكة العربية السعودية',
                'type' => 'string',
                'group' => 'contact',
                'description' => 'Business address in Arabic'
            ]
        ];

        foreach ($settings as $setting) {
            PlatformSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}