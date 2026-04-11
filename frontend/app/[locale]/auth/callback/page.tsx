'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useUserStore } from '@/lib/userStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { login } = useUserStore();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(locale === 'en' ? 'Authentication failed. Please try again.' : 'فشلت المصادقة. يرجى المحاولة مرة أخرى.');
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 3000);
        return;
      }

      if (!token) {
        setError(locale === 'en' ? 'No authentication token received.' : 'لم يتم استلام رمز المصادقة.');
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 3000);
        return;
      }

      try {
        // Store token
        localStorage.setItem('auth_token', token);
        console.log('✅ Token stored in localStorage:', token.substring(0, 20) + '...');
        console.log('✅ Verify token retrieval:', localStorage.getItem('auth_token')?.substring(0, 20) + '...');

        // Fetch user data
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error('Failed to fetch user data');
        }

        console.log('✅ User data fetched:', data.data.user);

        // Store user in Zustand
        login(data.data.user);
        console.log('✅ User stored in Zustand');

        // Redirect based on role
        if (data.data.user.role === 'super_admin') {
          router.push(`/${locale}/super-admin`);
        } else if (data.data.user.role === 'tenant_admin' || data.data.user.role === 'admin') {
          router.push(`/${locale}/admin`);
        } else {
          router.push(`/${locale}/account`);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(locale === 'en' ? 'Authentication failed. Please try again.' : 'فشلت المصادقة. يرجى المحاولة مرة أخرى.');
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, locale, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg text-red-600">{error}</p>
            <p className="text-sm text-neutral-600">
              {locale === 'en' ? 'Redirecting to login...' : 'إعادة التوجيه إلى تسجيل الدخول...'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
            <p className="text-lg text-neutral-900">
              {locale === 'en' ? 'Completing authentication...' : 'إتمام المصادقة...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
