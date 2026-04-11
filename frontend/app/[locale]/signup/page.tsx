'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUserStore } from '@/lib/userStore';
import Image from 'next/image';
export default function SignupPage() {
  const locale = useLocale();
  const router = useRouter();
  const { login } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(locale === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 8) {
      setError(locale === 'en' ? 'Password must be at least 8 characters' : 'يجب أن تكون كلمة المرور 8 أحرف على الأقل');
      return;
    }

    if (!formData.agreeToTerms) {
      setError(locale === 'en' ? 'Please agree to the terms and conditions' : 'يرجى الموافقة على الشروط والأحكام');
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.success && data.data) {
        const { user, token } = data.data;
        
        // Store token
        localStorage.setItem('auth_token', token);
        
        // Store user in Zustand
        login(user);
        
        // Redirect to account
        router.push(`/${locale}/account`);
      } else {
        setError(locale === 'en' ? 'Registration failed. Please try again.' : 'فشل التسجيل. يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || (locale === 'en' ? 'An error occurred. Please try again.' : 'حدث خطأ. يرجى المحاولة مرة أخرى.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleSocialSignup = (provider: string) => {
    if (provider === 'Google') {
      handleGoogleSignup();
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
 <div className='flex flex-col items-center justify-center gap-4'>
                <Image
                  src="/zlogo.svg"
                  alt={locale === 'ar' ? 'زينا' : 'Zeina'}
                  width={400}
                  height={60}
                  className="h-20 w-auto"
                />                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
                {locale === 'en' ? 'Create Account' : 'إنشاء حساب'}
              </h1>
              <p className="text-neutral-600 text-sm">
                {locale === 'en' ? 'Join us today' : 'انضم إلينا اليوم'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {locale === 'en' ? 'Full Name' : 'الاسم الكامل'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                    placeholder={locale === 'en' ? 'John Doe' : 'أحمد محمد'}
                    required
                  />
                </div>
              </div>

              {/* Email */}
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
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {locale === 'en' ? 'Phone Number' : 'رقم الهاتف'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                    placeholder="+966 50 123 4567"
                    required
                  />
                </div>
              </div>

              {/* Password */}
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {locale === 'en' ? 'Confirm Password' : 'تأكيد كلمة المرور'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300 mt-0.5"
                  required
                />
                <span className="text-sm text-neutral-600">
                  {locale === 'en' ? 'I agree to the ' : 'أوافق على '}
                  <Link href={`/${locale}/terms`} className="text-neutral-900 hover:underline">
                    {locale === 'en' ? 'Terms and Conditions' : 'الشروط والأحكام'}
                  </Link>
                  {locale === 'en' ? ' and ' : ' و'}
                  <Link href={`/${locale}/privacy`} className="text-neutral-900 hover:underline">
                    {locale === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
                  </Link>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (locale === 'en' ? 'Creating account...' : 'جاري إنشاء الحساب...') : (locale === 'en' ? 'Create Account' : 'إنشاء حساب')}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500">
                  {locale === 'en' ? 'Or sign up with' : 'أو سجل مع'}
                </span>
              </div>
            </div>

            {/* Social Signup Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialSignup('Google')}
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
                onClick={() => handleSocialSignup('Facebook')}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-neutral-600">
              {locale === 'en' ? 'Already have an account? ' : 'لديك حساب بالفعل؟ '}
              <Link href={`/${locale}/login`} className="text-neutral-900 font-semibold hover:underline">
                {locale === 'en' ? 'Sign in' : 'سجل الدخول'}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
