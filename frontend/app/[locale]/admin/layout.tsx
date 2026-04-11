'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBasket, 
  Users, 
  Settings, 
  BarChart3,
  Tag,
  LogOut,
  Menu,
  X,
  Truck,
  Gift,
  MessageCircle,
  Hash,
  Image
} from 'lucide-react';
import { useUserStore } from '@/lib/userStore';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';
import { usePlatformRefresh } from '@/hooks/usePlatformRefresh';
import AdminDebug from '@/components/AdminDebug';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'en';
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [mounted, setMounted] = useState(false);
  const { profile, isLoggedIn, logout } = useUserStore();
  const { getSetting } = usePlatformSettings();
  usePlatformRefresh(); 
  const isAdmin = profile?.role === 'tenant_admin' || profile?.role === 'admin';

  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) { 
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (mounted && (!isLoggedIn || !isAdmin)) {
      console.log('Admin access denied. Redirecting to login...', { isLoggedIn, isAdmin, profile });
      router.push(`/${locale}/login`);
    }
  }, [mounted, isLoggedIn, isAdmin, router, locale, profile]);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/login`);
  };


  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { 
      name: locale === 'ar' ? 'لوحة التحكم' : 'Dashboard', 
      href: `/${locale}/admin`, 
      icon: LayoutDashboard 
    },
    { 
      name: locale === 'ar' ? 'المنتجات' : 'Products', 
      href: `/${locale}/admin/products`, 
      icon: Package 
    },
    { 
      name: locale === 'ar' ? 'الطلبات' : 'Orders', 
      href: `/${locale}/admin/orders`, 
      icon: ShoppingBasket 
    },
    { 
      name: locale === 'ar' ? 'العملاء' : 'Customers', 
      href: `/${locale}/admin/customers`, 
      icon: Users 
    },

    // { 
    //   name: locale === 'ar' ? 'تخطيط الصفحة الرئيسية' : 'Home Layout', 
    //   href: `/${locale}/admin/home-layout`, 
    //   icon: LayoutDashboard 
    // },
    { 
      name: locale === 'ar' ? 'أكواد الخصم' : 'Promo Codes', 
      href: `/${locale}/admin/promo-codes`, 
      icon: Gift 
    },
    // { 
    //   name: locale === 'ar' ? 'موظفو التوصيل' : 'Delivery Personnel', 
    //   href: `/${locale}/admin/delivery`, 
    //   icon: Truck 
    // },
    // { 
    //   name: locale === 'ar' ? 'إشعارات التوصيل' : 'Delivery Notifications', 
    //   href: `/${locale}/admin/delivery-notifications`, 
    //   icon: MessageCircle 
    // },
    { 
      name: locale === 'ar' ? 'التحليلات' : 'Analytics', 
      href: `/${locale}/admin/analytics`, 
      icon: BarChart3 
    },
    { 
      name: locale === 'ar' ? 'الإعدادات' : 'Settings', 
      href: `/${locale}/admin/settings`, 
      icon: Settings 
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-black text-white w-64`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-neutral-800 relative">
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-neutral-800 rounded lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            
            {getSetting('use_logo_instead_of_text') === 'true' && getSetting('platform_logo_dark') ? (
              <img 
                src={getSetting('platform_logo_dark')} 
                alt={locale === 'ar' ? 'zna' : 'Zeina'}
                className="h-8 w-auto mb-2"
              />
            ) : (
              <h1 className="text-2xl font-bold pr-8 lg:pr-0">
                {locale === 'ar' ? 'زينة' : 'Zeina'}
              </h1>
            )}
            <p className="text-sm text-neutral-400 mt-1">{locale === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== `/${locale}/admin` && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors rounded-lg ${
                    isActive
                      ? 'bg-white text-black font-medium'
                      : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-neutral-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-neutral-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{profile?.name || 'Admin User'}</p>
                <p className="text-xs text-neutral-500">{profile?.email || 'admin@zeina.com'}</p>
              </div>
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                {profile?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && <AdminDebug />}
    </div>
  );
}
