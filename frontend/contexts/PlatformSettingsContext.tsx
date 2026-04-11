'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PlatformSettings {
  // Branding
  platform_name: string;
  platform_name_ar: string;
  platform_tagline: string;
  platform_tagline_ar: string;
  platform_logo: string;
  platform_logo_dark: string;
  use_logo_instead_of_text: string;
  
  // Theme Colors
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  header_background: string;
  footer_background: string;
  body_background: string;
  
  // Contact
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  contact_address_ar: string;
}

interface PlatformSettingsContextType {
  settings: PlatformSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  getSetting: (key: keyof PlatformSettings, defaultValue?: string) => string;
}

const defaultSettings: PlatformSettings = {
  platform_name: 'Zeina',
  platform_name_ar: 'zna',
  platform_tagline: 'Premium Flowers & Gifts Delivery',
  platform_tagline_ar: ' Flowers & Gifts Delivery',
  platform_logo: '',
  platform_logo_dark: '',
  use_logo_instead_of_text: 'false',
  primary_color: '#050505',
  secondary_color: '#f59e0b',
  accent_color: '#ef4444',
  success_color: '#10b981',
  warning_color: '#f59e0b',
  error_color: '#ef4444',
  header_background: '#ffffff',
  footer_background: '#ffffff',
  body_background: '#f9fafb',
  contact_phone: '+966 50 123 4567',
  contact_email: 'info@zeina.sa',
  contact_address: 'Riyadh, Saudi Arabia',
  contact_address_ar: 'الرياض، المملكة العربية السعودية'
};

const PlatformSettingsContext = createContext<PlatformSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
  getSetting: (key, defaultValue) => defaultValue || ''
});

export const usePlatformSettings = () => {
  const context = useContext(PlatformSettingsContext);
  if (!context) {
    throw new Error('usePlatformSettings must be used within a PlatformSettingsProvider');
  }
  return context;
};

interface PlatformSettingsProviderProps {
  children: React.ReactNode;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const PlatformSettingsProvider: React.FC<PlatformSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/platform-settings`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Merge with defaults to ensure all keys exist
          const mergedSettings = { ...defaultSettings, ...result.data };
          setSettings(mergedSettings);
          
          // Apply CSS custom properties for dynamic theming
          applyThemeColors(mergedSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching platform settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyThemeColors = (settings: PlatformSettings) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', settings.primary_color);
    root.style.setProperty('--color-secondary', settings.secondary_color);
    root.style.setProperty('--color-accent', settings.accent_color);
    root.style.setProperty('--color-success', settings.success_color);
    root.style.setProperty('--color-warning', settings.warning_color);
    root.style.setProperty('--color-error', settings.error_color);
    root.style.setProperty('--color-header-bg', settings.header_background);
    root.style.setProperty('--color-footer-bg', settings.footer_background);
    root.style.setProperty('--color-body-bg', settings.body_background);
  };

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  const getSetting = (key: keyof PlatformSettings, defaultValue?: string): string => {
    return settings[key] || defaultValue || '';
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Apply theme colors whenever settings change
  useEffect(() => {
    if (!loading) {
      applyThemeColors(settings);
    }
  }, [settings, loading]);

  const value: PlatformSettingsContextType = {
    settings,
    loading,
    refreshSettings,
    getSetting
  };

  return (
    <PlatformSettingsContext.Provider value={value}>
      {children}
    </PlatformSettingsContext.Provider>
  );
};