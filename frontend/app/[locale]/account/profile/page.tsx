'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Calendar, Package, Heart, Edit } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SARSymbol from '@/components/SARSymbol';
import { useUserStore } from '@/lib/userStore';

interface ProfileData {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    member_since: string;
  };
  stats: {
    total_orders: number;
    total_spent: number;
    wishlist_items: number;
  };
  recent_orders: Array<{
    id: number;
    order_number: string;
    date: string;
    amount: number;
    status: string;
  }>;
}

export default function ProfilePage() {
  const locale = useLocale() as 'en' | 'ar';
  const router = useRouter();
  const { profile } = useUserStore();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          router.push(`/${locale}/login`);
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error('Failed to fetch profile');
        }

        setProfileData(data.data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(locale === 'en' ? 'Failed to load profile data' : 'فشل تحميل بيانات الملف الشخصي');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [locale, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        {/* <Header /> */}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mb-4"></div>
            <p className="text-neutral-600">{locale === 'en' ? 'Loading profile...' : 'جاري تحميل الملف الشخصي...'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        {/* <Header /> */}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
            >
              {locale === 'en' ? 'Retry' : 'إعادة المحاولة'}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { user, stats, recent_orders } = profileData;

  const statsDisplay = [
    {
      label: locale === 'en' ? 'Total Orders' : 'إجمالي الطلبات',
      value: stats.total_orders,
      icon: Package,
    },
    {
      label: locale === 'en' ? 'Total Spent' : 'إجمالي الإنفاق',
      value: (
        <span className="flex items-center gap-1">
          <SARSymbol className="w-5 h-5" />
          {stats.total_spent.toFixed(2)}
        </span>
      ),
      icon: null,
    },
    {
      label: locale === 'en' ? 'Wishlist Items' : 'عناصر المفضلة',
      value: stats.wishlist_items,
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* <Header /> */}
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <Link
            href={`/${locale}/account`}
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'en' ? 'Back to Account' : 'العودة إلى الحساب'}
          </Link>

          {/* Profile Header */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-neutral-700" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-medium text-neutral-900 mb-3">{user.name}</h1>
                  <div className="space-y-2 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {locale === 'en' ? 'Member since' : 'عضو منذ'} {user.member_since}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium">
                <Edit className="w-4 h-4" />
                {locale === 'en' ? 'Edit Profile' : 'تعديل الملف'}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {statsDisplay.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-neutral-200 p-6"
                >
                  {Icon && (
                    <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-neutral-700" />
                    </div>
                  )}
                  <div className="text-2xl font-semibold text-neutral-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-neutral-600">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-xl font-medium text-neutral-900 mb-6">
                {locale === 'en' ? 'Personal Information' : 'المعلومات الشخصية'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">
                    {locale === 'en' ? 'Full Name' : 'الاسم الكامل'}
                  </label>
                  <div className="text-base text-neutral-900">{user.name}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">
                    {locale === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                  </label>
                  <div className="text-base text-neutral-900">{user.email}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">
                    {locale === 'en' ? 'Account Type' : 'نوع الحساب'}
                  </label>
                  <div className="text-base text-neutral-900 capitalize">{user.role}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-xl font-medium text-neutral-900 mb-6">
                {locale === 'en' ? 'Quick Actions' : 'إجراءات سريعة'}
              </h2>
              <div className="space-y-3">
                <Link
                  href={`/${locale}/account/orders`}
                  className="block w-full border border-neutral-300 rounded-lg p-3 text-center font-medium text-neutral-900 hover:border-neutral-900 hover:bg-neutral-50 transition-all"
                >
                  {locale === 'en' ? 'View Orders' : 'عرض الطلبات'}
                </Link>
                <Link
                  href={`/${locale}/wishlist`}
                  className="block w-full border border-neutral-300 rounded-lg p-3 text-center font-medium text-neutral-900 hover:border-neutral-900 hover:bg-neutral-50 transition-all"
                >
                  {locale === 'en' ? 'View Wishlist' : 'عرض المفضلة'}
                </Link>
                <Link
                  href={`/${locale}/account/settings`}
                  className="block w-full border border-neutral-300 rounded-lg p-3 text-center font-medium text-neutral-900 hover:border-neutral-900 hover:bg-neutral-50 transition-all"
                >
                  {locale === 'en' ? 'Account Settings' : 'إعدادات الحساب'}
                </Link>
                <button className="block w-full bg-neutral-900 text-white rounded-lg p-3 text-center font-medium hover:bg-neutral-800 transition-all">
                  {locale === 'en' ? 'Change Password' : 'تغيير كلمة المرور'}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-xl font-medium text-neutral-900 mb-6">
              {locale === 'en' ? 'Recent Activity' : 'النشاط الأخير'}
            </h2>
            {recent_orders.length > 0 ? (
              <div className="space-y-4">
                {recent_orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-neutral-100 last:border-0 gap-2"
                  >
                    <div>
                      <div className="font-medium text-neutral-900">
                        {locale === 'en' ? `Order #${order.order_number}` : `طلب #${order.order_number}`}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {locale === 'en' ? `${order.status} on ${order.date}` : `${order.status} في ${order.date}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-lg font-semibold text-neutral-900">
                      <SARSymbol className="w-4 h-4" />
                      {typeof order.amount === 'string' ? parseFloat(order.amount).toFixed(2) : order.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 text-center py-8">
                {locale === 'en' ? 'No orders yet' : 'لا توجد طلبات بعد'}
              </p>
            )}
            <Link
              href={`/${locale}/account/orders`}
              className="inline-flex items-center gap-2 mt-6 text-neutral-900 font-medium hover:gap-3 transition-all"
            >
              {locale === 'en' ? 'View All Orders' : 'عرض جميع الطلبات'}
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
