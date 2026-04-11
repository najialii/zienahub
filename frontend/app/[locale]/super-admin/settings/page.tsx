'use client';

import { useState, useEffect } from 'react';
import { Save, Globe, CreditCard, Truck, Bell, Shield, Loader2, Palette, Type, Upload, X, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { usePlatformRefresh } from '@/hooks/usePlatformRefresh';
import SARSymbol from '@/components/SARSymbol';

interface GeneralSettings {
  store_email: string;
  store_phone: string;
  currency: string;
  language: string;
}

interface PaymentSettings {
  credit_card_enabled: boolean;
  mada_enabled: boolean;
  cod_enabled: boolean;
}

interface ShippingSettings {
  standard_shipping_fee: number;
  express_shipping_fee: number;
  free_shipping_threshold: number;
  estimated_delivery: string;
}

interface NotificationSettings {
  order_notifications: boolean;
  low_stock_alerts: boolean;
  customer_messages: boolean;
}

interface BrandingSettings {
  platform_name: string;
  platform_name_ar: string;
  platform_tagline: string;
  platform_tagline_ar: string;
  platform_logo: string;
  platform_logo_dark: string;
  use_logo_instead_of_text: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  contact_address_ar: string;
}

interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  header_background: string;
  footer_background: string;
  body_background: string;
}

interface AllSettings {
  general: GeneralSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  notifications: NotificationSettings;
  branding: BrandingSettings;
  theme: ThemeSettings;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { triggerRefresh } = usePlatformRefresh();
  
  const [settings, setSettings] = useState<AllSettings>({
    general: {
      store_email: 'info@zeina.com',
      store_phone: '+966 50 123 4567',
      currency: 'SAR',
      language: 'en',
    },
    payment: {
      credit_card_enabled: true,
      mada_enabled: true,
      cod_enabled: true,
    },
    shipping: {
      standard_shipping_fee: 25,
      express_shipping_fee: 50,
      free_shipping_threshold: 500,
      estimated_delivery: '2-5 business days',
    },
    notifications: {
      order_notifications: true,
      low_stock_alerts: true,
      customer_messages: true,
    },
    branding: {
      platform_name: 'Zeina',
      platform_name_ar: 'زينة',
      platform_tagline: 'Premium Flowers & Gifts Delivery',
      platform_tagline_ar: 'توصيل الأزهار والهدايا المميزة',
      platform_logo: '',
      platform_logo_dark: '',
      use_logo_instead_of_text: 'false',
      contact_phone: '+966 50 123 4567',
      contact_email: 'info@zeina.sa',
      contact_address: 'Riyadh, Saudi Arabia',
      contact_address_ar: 'الرياض، المملكة العربية السعودية'
    },
    theme: {
      primary_color: '#1f2937',
      secondary_color: '#f59e0b',
      accent_color: '#ef4444',
      success_color: '#10b981',
      warning_color: '#f59e0b',
      error_color: '#ef4444',
      header_background: '#ffffff',
      footer_background: '#1f2937',
      body_background: '#f9fafb'
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'branding', name: 'Branding', icon: Type },
    { id: 'theme', name: 'Theming', icon: Palette },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'shipping', name: 'Shipping', icon: Truck },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Check if we have a token
      const token = localStorage.getItem('auth_token');
      console.log('Auth token:', token ? 'Present' : 'Missing');
      
      // Fetch regular settings
      const data = await adminApi.getSettings();
      
      // Fetch platform settings
      const platformResponse = await fetch(`${API_BASE_URL}/admin/platform-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Platform settings response status:', platformResponse.status);
      
      let platformData: Record<string, string> = {};
      if (platformResponse.ok) {
        const platformResult = await platformResponse.json();
        // Convert grouped platform settings to flat object
        Object.values(platformResult.data).forEach((group: any) => {
          group.forEach((setting: any) => {
            // Handle null values by converting to empty string for form fields
            platformData[setting.key] = setting.value ?? '';
          });
        });
      }
      
      setSettings(prev => ({
        general: { ...prev.general, ...data.general },
        payment: { ...prev.payment, ...data.payment },
        shipping: { ...prev.shipping, ...data.shipping },
        notifications: { ...prev.notifications, ...data.notifications },
        branding: { ...prev.branding, ...platformData },
        theme: { ...prev.theme, ...platformData }
      }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (group: string) => {
    try {
      setSaving(true);
      setMessage(null);
      
      if (group === 'branding' || group === 'theme') {
        // Save platform settings
        const groupSettings = settings[group as keyof AllSettings];
        
        // Filter out null, undefined values, but allow empty strings for optional fields like logos
        const optionalFields = ['platform_logo', 'platform_logo_dark'];
        const filteredSettings = Object.entries(groupSettings).reduce((acc, [key, value]) => {
          // For optional fields, allow empty strings
          if (optionalFields.includes(key)) {
            if (value !== null && value !== undefined) {
              acc[key] = value;
            }
          } else {
            // For required fields, skip null/empty values
            if (value !== null && value !== undefined && value !== '') {
              acc[key] = value;
            }
          }
          return acc;
        }, {} as Record<string, any>);
        
        const token = localStorage.getItem('auth_token');
        console.log('Saving platform settings:', { group, settings: filteredSettings, token: token ? 'Present' : 'Missing' });
        
        const response = await fetch(`${API_BASE_URL}/admin/platform-settings/batch`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ settings: filteredSettings }),
        });
        
        console.log('Save response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Save error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        if (response.ok) {
          triggerRefresh(); // Refresh platform settings across the app
          setMessage({ type: 'success', text: 'Settings saved successfully! Changes applied across the platform.' });
        } else {
          throw new Error('Failed to save platform settings');
        }
      } else {
        // Save regular settings
        const groupSettings = settings[group as keyof AllSettings];
        await adminApi.updateSettings(group, groupSettings);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      }
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    try {
      setSaving(true);
      setMessage(null);
      await adminApi.updatePassword(passwordForm);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to update password:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  const updateGeneralField = (field: keyof GeneralSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }));
  };

  const updatePaymentField = (field: keyof PaymentSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      payment: { ...prev.payment, [field]: value }
    }));
  };

  const updateShippingField = (field: keyof ShippingSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: value }
    }));
  };

  const updateNotificationField = (field: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const updateBrandingField = (field: keyof BrandingSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      branding: { ...prev.branding, [field]: value }
    }));
  };

  const updateThemeField = (field: keyof ThemeSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      theme: { ...prev.theme, [field]: value }
    }));
  };

  const handleFileUpload = async (key: string, file: File) => {
    setUploading(prev => ({ ...prev, [key]: true }));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');

      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        updateBrandingField(key as keyof BrandingSettings, result.data.full_url);
      } else {
        setMessage({ type: 'error', text: 'Failed to upload file' });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ type: 'error', text: 'Error uploading file' });
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Settings</h1>
        <p className="text-neutral-600 mt-1">Manage your store configuration</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-neutral-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 text-left border-b border-neutral-200 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'hover:bg-neutral-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 border border-neutral-200">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black">General Settings</h2>
                


                <div>
                  <label className="block text-sm font-medium text-black mb-2">Store Email</label>
                  <input
                    type="email"
                    value={settings.general.store_email}
                    onChange={(e) => updateGeneralField('store_email', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Store Phone</label>
                  <input
                    type="tel"
                    value={settings.general.store_phone}
                    onChange={(e) => updateGeneralField('store_phone', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Currency</label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) => updateGeneralField('currency', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  >
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Language</label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => updateGeneralField('language', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>

                <button
                  onClick={() => saveSettings('general')}
                  disabled={saving}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black">Payment Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-neutral-200">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6" />
                      <div>
                        <p className="font-medium text-black">Credit Card</p>
                        <p className="text-sm text-neutral-500">Accept Visa, Mastercard</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.payment.credit_card_enabled}
                        onChange={(e) => updatePaymentField('credit_card_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-checked:bg-black rounded-full peer-focus:ring-2 peer-focus:ring-neutral-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-neutral-200">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6" />
                      <div>
                        <p className="font-medium text-black">Mada</p>
                        <p className="text-sm text-neutral-500">Saudi payment network</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.payment.mada_enabled}
                        onChange={(e) => updatePaymentField('mada_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-checked:bg-black rounded-full peer-focus:ring-2 peer-focus:ring-neutral-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-neutral-200">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6" />
                      <div>
                        <p className="font-medium text-black">Cash on Delivery</p>
                        <p className="text-sm text-neutral-500">Pay when you receive</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.payment.cod_enabled}
                        onChange={(e) => updatePaymentField('cod_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-checked:bg-black rounded-full peer-focus:ring-2 peer-focus:ring-neutral-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => saveSettings('payment')}
                  disabled={saving}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black">Shipping Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2 flex items-center gap-1">
                    Standard Shipping Fee <SARSymbol className="w-4 h-4" />
                  </label>
                  <input
                    type="number"
                    value={settings.shipping.standard_shipping_fee}
                    onChange={(e) => updateShippingField('standard_shipping_fee', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2 flex items-center gap-1">
                    Express Shipping Fee <SARSymbol className="w-4 h-4" />
                  </label>
                  <input
                    type="number"
                    value={settings.shipping.express_shipping_fee}
                    onChange={(e) => updateShippingField('express_shipping_fee', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2 flex items-center gap-1">
                    Free Shipping Threshold <SARSymbol className="w-4 h-4" />
                  </label>
                  <input
                    type="number"
                    value={settings.shipping.free_shipping_threshold}
                    onChange={(e) => updateShippingField('free_shipping_threshold', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Estimated Delivery Time</label>
                  <input
                    type="text"
                    value={settings.shipping.estimated_delivery}
                    onChange={(e) => updateShippingField('estimated_delivery', e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  onClick={() => saveSettings('shipping')}
                  disabled={saving}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-neutral-200">
                    <div>
                      <p className="font-medium text-black">Order Notifications</p>
                      <p className="text-sm text-neutral-500">Get notified about new orders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.order_notifications}
                        onChange={(e) => updateNotificationField('order_notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-checked:bg-black rounded-full peer-focus:ring-2 peer-focus:ring-neutral-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-neutral-200">
                    <div>
                      <p className="font-medium text-black">Low Stock Alerts</p>
                      <p className="text-sm text-neutral-500">Alert when products are low</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.low_stock_alerts}
                        onChange={(e) => updateNotificationField('low_stock_alerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-checked:bg-black rounded-full peer-focus:ring-2 peer-focus:ring-neutral-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-neutral-200">
                    <div>
                      <p className="font-medium text-black">Customer Messages</p>
                      <p className="text-sm text-neutral-500">Notifications for customer inquiries</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.customer_messages}
                        onChange={(e) => updateNotificationField('customer_messages', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-checked:bg-black rounded-full peer-focus:ring-2 peer-focus:ring-neutral-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => saveSettings('notifications')}
                  disabled={saving}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black">Branding Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Platform Name (English)</label>
                    <input
                      type="text"
                      value={settings.branding.platform_name}
                      onChange={(e) => updateBrandingField('platform_name', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Platform Name (Arabic)</label>
                    <input
                      type="text"
                      value={settings.branding.platform_name_ar}
                      onChange={(e) => updateBrandingField('platform_name_ar', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Tagline (English)</label>
                    <input
                      type="text"
                      value={settings.branding.platform_tagline}
                      onChange={(e) => updateBrandingField('platform_tagline', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Tagline (Arabic)</label>
                    <input
                      type="text"
                      value={settings.branding.platform_tagline_ar}
                      onChange={(e) => updateBrandingField('platform_tagline_ar', e.target.value)}
                      className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Logo Upload Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Logo Settings</h3>
                  
                  <div className="flex items-center gap-4 p-4 border border-neutral-200">
                    <input
                      type="checkbox"
                      checked={settings.branding.use_logo_instead_of_text === 'true'}
                      onChange={(e) => updateBrandingField('use_logo_instead_of_text', e.target.checked ? 'true' : 'false')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-black">Use logo instead of text</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Light Logo */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Logo (Light Theme)</label>
                      {settings.branding.platform_logo && (
                        <div className="mb-3 p-3 bg-gray-50 rounded border flex items-center gap-3">
                          <img src={settings.branding.platform_logo} alt="Logo" className="h-12 w-auto" />
                          <button
                            onClick={() => updateBrandingField('platform_logo', '')}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".svg,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('platform_logo', file);
                          }}
                          className="hidden"
                          id="logo-light"
                        />
                        <label
                          htmlFor="logo-light"
                          className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-neutral-800 cursor-pointer"
                        >
                          {uploading.platform_logo ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {uploading.platform_logo ? 'Uploading...' : 'Upload Logo'}
                        </label>
                      </div>
                    </div>

                    {/* Dark Logo */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Logo (Dark Theme)</label>
                      {settings.branding.platform_logo_dark && (
                        <div className="mb-3 p-3 bg-gray-900 rounded border flex items-center gap-3">
                          <img src={settings.branding.platform_logo_dark} alt="Dark Logo" className="h-12 w-auto" />
                          <button
                            onClick={() => updateBrandingField('platform_logo_dark', '')}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".svg,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('platform_logo_dark', file);
                          }}
                          className="hidden"
                          id="logo-dark"
                        />
                        <label
                          htmlFor="logo-dark"
                          className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-neutral-800 cursor-pointer"
                        >
                          {uploading.platform_logo_dark ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {uploading.platform_logo_dark ? 'Uploading...' : 'Upload Dark Logo'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Phone</label>
                      <input
                        type="tel"
                        value={settings.branding.contact_phone}
                        onChange={(e) => updateBrandingField('contact_phone', e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Email</label>
                      <input
                        type="email"
                        value={settings.branding.contact_email}
                        onChange={(e) => updateBrandingField('contact_email', e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Address (English)</label>
                      <input
                        type="text"
                        value={settings.branding.contact_address}
                        onChange={(e) => updateBrandingField('contact_address', e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Address (Arabic)</label>
                      <input
                        type="text"
                        value={settings.branding.contact_address_ar}
                        onChange={(e) => updateBrandingField('contact_address_ar', e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => saveSettings('branding')}
                  disabled={saving}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Branding Settings
                </button>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black">Theme Settings</h2>
                <p className="text-neutral-600">Customize your platform colors. Changes will apply across the entire platform.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Primary Colors */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.theme.primary_color}
                        onChange={(e) => updateThemeField('primary_color', e.target.value)}
                        className="w-12 h-10 rounded border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={settings.theme.primary_color}
                        onChange={(e) => updateThemeField('primary_color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Secondary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.theme.secondary_color}
                        onChange={(e) => updateThemeField('secondary_color', e.target.value)}
                        className="w-12 h-10 rounded border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={settings.theme.secondary_color}
                        onChange={(e) => updateThemeField('secondary_color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Accent Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.theme.accent_color}
                        onChange={(e) => updateThemeField('accent_color', e.target.value)}
                        className="w-12 h-10 rounded border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={settings.theme.accent_color}
                        onChange={(e) => updateThemeField('accent_color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                        placeholder="#ef4444"
                      />
                    </div>
                  </div>

                  {/* State Colors */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Success Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.theme.success_color}
                        onChange={(e) => updateThemeField('success_color', e.target.value)}
                        className="w-12 h-10 rounded border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={settings.theme.success_color}
                        onChange={(e) => updateThemeField('success_color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                        placeholder="#10b981"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Warning Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.theme.warning_color}
                        onChange={(e) => updateThemeField('warning_color', e.target.value)}
                        className="w-12 h-10 rounded border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={settings.theme.warning_color}
                        onChange={(e) => updateThemeField('warning_color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Error Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.theme.error_color}
                        onChange={(e) => updateThemeField('error_color', e.target.value)}
                        className="w-12 h-10 rounded border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={settings.theme.error_color}
                        onChange={(e) => updateThemeField('error_color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                        placeholder="#ef4444"
                      />
                    </div>
                  </div>

                  {/* Layout Colors */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Header Background</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.theme.header_background}
                        onChange={(e) => updateThemeField('header_background', e.target.value)}
                        className="w-12 h-10 rounded border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={settings.theme.header_background}
                        onChange={(e) => updateThemeField('header_background', e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Footer Background</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.theme.footer_background}
                        onChange={(e) => updateThemeField('footer_background', e.target.value)}
                        className="w-12 h-10 rounded border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={settings.theme.footer_background}
                        onChange={(e) => updateThemeField('footer_background', e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Body Background</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.theme.body_background}
                        onChange={(e) => updateThemeField('body_background', e.target.value)}
                        className="w-12 h-10 rounded border border-neutral-300"
                      />
                      <input
                        type="text"
                        value={settings.theme.body_background}
                        onChange={(e) => updateThemeField('body_background', e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                        placeholder="#f9fafb"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="bg-neutral-50 p-6 rounded border">
                  <h3 className="text-lg font-semibold text-black mb-4">Color Preview</h3>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(settings.theme).map(([key, color]) => (
                      <div key={key} className="text-center">
                        <div 
                          className="w-16 h-16 rounded border border-gray-200 mb-2"
                          style={{ backgroundColor: color }}
                        ></div>
                        <p className="text-xs text-gray-600 capitalize">
                          {key.replace('_', ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => saveSettings('theme')}
                  disabled={saving}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Theme Settings
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-black">Security Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.new_password_confirmation}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                    className="w-full px-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  onClick={updatePassword}
                  disabled={saving || !passwordForm.current_password || !passwordForm.new_password}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Update Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
