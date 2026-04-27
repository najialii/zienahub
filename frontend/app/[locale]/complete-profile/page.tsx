'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { User, Mail } from 'lucide-react';
import { useUserStore } from '@/lib/userStore';
import Image from 'next/image';

export default function CompleteProfilePage() {
  const locale = useLocale();
  const router = useRouter();
  const { profile, updateProfile, isLoggedIn } = useUserStore();
  const isRtl = locale === 'ar';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    // If not logged in, redirect to signup
    if (!isLoggedIn) {
      router.replace(`/${locale}/signup`);
    }
    // If profile already completed, redirect to account
    if (profile?.name && profile?.email) {
      router.replace(`/${locale}/account`);
    }
  }, [isLoggedIn, profile, locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to complete profile');

      if (data.success && data.data) {
        updateProfile(data.data.user);
        router.push(`/${locale}/account`);
      }
    } catch (err: any) {
      setError(err.message || (isRtl ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">

            <div className="flex flex-col items-center gap-3 mb-8">
              <Image src="/zlogo.svg" alt="Zinea" width={400} height={60} className="h-16 w-auto" />
              <h1 className="text-2xl font-bold text-neutral-900">
                {isRtl ? 'أكمل ملفك الشخصي' : 'Complete Your Profile'}
              </h1>
              <p className="text-sm text-neutral-500 text-center">
                {isRtl ? 'أضف اسمك وبريدك الإلكتروني لإكمال حسابك' : 'Add your name and email to finish setting up your account'}
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {isRtl ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                    placeholder={isRtl ? 'أحمد محمد' : 'John Doe'}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? (isRtl ? 'جاري الحفظ...' : 'Saving...')
                  : (isRtl ? 'حفظ وإكمال' : 'Save & Continue')}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
