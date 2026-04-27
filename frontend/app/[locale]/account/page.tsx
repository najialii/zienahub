'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, MapPin, Settings, ChevronRight, LogOut } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUserStore } from '@/lib/userStore';

export default function AccountPage() {
  const locale = useLocale();
  const router = useRouter();
  const { profile, logout } = useUserStore();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local storage and logout
      localStorage.removeItem('auth_token');
      logout();
      router.push(`/${locale}/login`);
    }
  };

  const menuItems = [
    {
      icon: User,
      label: locale === 'en' ? 'Profile' : 'الملف الشخصي',
      description: locale === 'en' ? 'Manage your personal information' : 'إدارة معلوماتك الشخصية',
      href: '/account/profile',
    },
    {
      icon: Package,
      label: locale === 'en' ? 'Orders' : 'الطلبات',
      description: locale === 'en' ? 'Track and view your orders' : 'تتبع وعرض طلباتك',
      href: '/account/orders',
    },
    {
      icon: Heart,
      label: locale === 'en' ? 'Wishlist' : 'المفضلة',
      description: locale === 'en' ? 'View your saved items' : 'عرض العناصر المحفوظة',
      href: '/wishlist',
    },
    {
      icon: MapPin,
      label: locale === 'en' ? 'Addresses' : 'العناوين',
      description: locale === 'en' ? 'Manage delivery addresses' : 'إدارة عناوين التسليم',
      href: '/account/addresses',
    },
    {
      icon: Settings,
      label: locale === 'en' ? 'Settings' : 'الإعدادات',
      description: locale === 'en' ? 'Account preferences' : 'تفضيلات الحساب',
      href: '/account/settings',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-medium text-neutral-900 mb-2">
                {locale === 'en' ? 'My Account' : 'حسابي'}
              </h1>
              <p className="text-neutral-600">
                {locale === 'en' ? `Welcome back, ${profile?.name || 'User'}` : `مرحباً بعودتك، ${profile?.name || 'مستخدم'}`}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              title={locale === 'en' ? 'Logout' : 'تسجيل الخروج'}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === 'en' ? 'Logout' : 'خروج'}</span>
            </button>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className="group bg-white rounded-lg border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                      <Icon className="w-6 h-6 text-neutral-700 group-hover:text-white transition-colors" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">
                    {item.label}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
