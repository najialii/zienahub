'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  Truck,
  LogOut, 
  Tag, 
  Settings,
  Hash, 
  Image as ImageIcon, 
  LayoutDashboard 
} from 'lucide-react';
import { useUserStore } from '@/lib/userStore';

export default function SuperAdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as 'en' | 'ar') || 'en';
  
  const { profile, isLoggedIn, logout, _hasHydrated } = useUserStore();
  
  const isSuperAdmin = profile?.role === 'super_admin';

  useEffect(() => {
    if (_hasHydrated) {
      if (!isLoggedIn || !isSuperAdmin) {
        router.push(`/${locale}/login`);
      }
    }
  }, [_hasHydrated, isLoggedIn, isSuperAdmin, router, locale]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn || !isSuperAdmin) {
    return null;
  }

  const menuItems = [
    { 
      name: locale === 'ar' ? 'لوحة التحكم' : 'Dashboard', 
      href: `/${locale}/super-admin`, 
      icon: LayoutDashboard 
    },
    { 
      name: locale === 'ar' ? 'المتاجر (Tenants)' : 'Tenants', 
      href: `/${locale}/super-admin/vendors`, 
      icon: Building2 
    },
    { 
      name: locale === 'ar' ? 'الفئات العالمية' : 'Global Categories', 
      href: `/${locale}/super-admin/categories`, 
      icon: Tag 
    },
    { 
      name: locale === 'ar' ? 'الوسوم' : 'Tags', 
      href: `/${locale}/super-admin/tags`, 
      icon: Hash 
    },
    { 
      name: locale === 'ar' ? 'البانرات' : 'Banners', 
    href: `/${locale}/super-admin/banners`, 
      icon: ImageIcon 
    },

    { 
      name: locale === 'ar' ? 'الإعدادات' : 'Settings', 
      href: `/${locale}/super-admin/settings`, 
      icon: Settings 
    },

     { 
      name: locale === 'ar' ? 'تخطيط الصفحة الرئيسية' : 'Home Layout', 
      href: `/${locale}/super-admin/home-layout`, 
      icon: LayoutDashboard 
    },

     { 
      name: locale === 'ar' ? 'موظفو التوصيل' : 'Delivery Personnel', 
      href: `/${locale}/super-admin/delivery`, 
      icon: Truck  
    },

    // { 
    //   name: locale === 'ar' ? 'إشعارات التوصيل' : 'Delivery Notifications', 
    //   href: `/${locale}/admin/delivery-notifications`, 
    //   icon: MessageCircle 
    // },
    // { 
    //   name: locale === 'ar' ? 'عرض إدارة المتجر' : 'Tenant Admin View', 
    //   href: `/${locale}/admin`, 
    //   icon: Users 
    // },
  ];

  return (
    <div className="min-h-screen bg-neutral-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <aside className={`fixed top-0 ${locale === 'ar' ? 'right-0' : 'left-0'} h-screen w-64 bg-black text-white flex flex-col`}>
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl font-bold tracking-tight">ZeinaHub</h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase">Super Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-900 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={() => {
              logout();
              router.push(`/${locale}/login`);
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-950/30 hover:text-red-400 text-neutral-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      <main className={`${locale === 'ar' ? 'mr-64' : 'ml-64'} p-8 min-h-screen`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}