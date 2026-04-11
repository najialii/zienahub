'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUserStore } from '@/lib/userStore';
import Image from 'next/image';

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const { login } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data) {
        const { user, token } = data.data;
        
        // Store token in localStorage
        localStorage.setItem('auth_token', token);
        console.log('Token stored in localStorage:', token.substring(0, 20) + '...');
        console.log('Verify token in localStorage:', localStorage.getItem('auth_token')?.substring(0, 20) + '...');
        
        console.log('Logging in user:', user);
        login(user);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (user.role === 'super_admin') {
          console.log('Redirecting to super admin dashboard');
          router.push(`/${locale}/super-admin`);
        } else if (user.role === 'tenant_admin' || user.role === 'admin') {
          console.log('Redirecting to tenant admin dashboard');
          router.push(`/${locale}/admin`);
        } else {
          console.log('Redirecting to account page');
          router.push(`/${locale}/account`);
        }
      } else {
        setError(locale === 'en' ? 'Invalid email or password' : 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(locale === 'en' ? 'Invalid email or password' : 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      handleGoogleLogin();
    } else {
      alert(`${provider} authentication will be available soon!`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className='flex flex-col items-center justify-center gap-4'>
                <Image
                  src="/zlogo.svg"
                  alt={locale === 'ar' ? 'زينا' : 'Zeina'}
                  width={400}
                  height={60}
                  className="h-20 w-auto"
                />
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                  {locale === 'en' ? 'Welcome Back' : 'مرحباً بعودتك'}
                </h1>

                <p className="text-neutral-600 text-sm">
                  {locale === 'en' ? 'Sign in to your account' : 'سجل الدخول إلى حسابك'}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {locale === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                    placeholder={locale === 'en' ? 'your@email.com' : 'your@email.com'}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {locale === 'en' ? 'Password' : 'كلمة المرور'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                  />
                  <span className="text-sm text-neutral-600">
                    {locale === 'en' ? 'Remember me' : 'تذكرني'}
                  </span>
                </label>
                <Link href={`/${locale}/forgot-password`} className="text-sm text-neutral-900 hover:underline">
                  {locale === 'en' ? 'Forgot password?' : 'نسيت كلمة المرور؟'}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (locale === 'en' ? 'Signing in...' : 'جاري تسجيل الدخول...') : (locale === 'en' ? 'Sign In' : 'تسجيل الدخول')}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500">
                  {locale === 'en' ? 'Or continue with' : 'أو تابع مع'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin('Facebook')}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-neutral-600">
              {locale === 'en' ? "Don't have an account? " : 'ليس لديك حساب؟ '}
              <Link href={`/${locale}/signup`} className="text-neutral-900 font-semibold hover:underline">
                {locale === 'en' ? 'Sign up' : 'سجل الآن'}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}