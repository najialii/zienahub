'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Phone, ShoppingBag, Store, Building2, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import { useUserStore } from '@/lib/userStore';
import Image from 'next/image';

type AccountType = 'customer' | 'seller';
type Step = 1 | 2;

export default function SignupPage() {
  const locale = useLocale();
  const router = useRouter();
  const { login } = useUserStore();

  const [step, setStep] = useState<Step>(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    storeName: '',
  });

  const isRtl = locale === 'ar';

  const handleSelectType = (type: AccountType) => {
    setAccountType(type);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(isRtl ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError(isRtl ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          account_type: accountType,
          ...(accountType === 'seller' && { store_name: formData.storeName }),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      if (data.success && data.data) {
        const { user, token } = data.data;
        localStorage.setItem('auth_token', token);
        login(user);
        if (accountType === 'seller') {
          router.push(`/${locale}/pending-verification`);
        } else {
          router.push(`/${locale}/complete-profile`);
        }
      }
    } catch (err: any) {
      setError(err.message || (isRtl ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.password.length >= 8 ? 
    (formData.password.length >= 12 ? 'strong' : 'medium') : 
    formData.password.length > 0 ? 'weak' : '';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Side - Branding & Info */}
            <div className="hidden lg:flex flex-col justify-center space-y-8 px-8">
              <div>
                <Image src="/zlogo.svg" alt="Zinea" width={200} height={40} className="h-12 w-auto mb-8" />
                <h1 className="text-4xl font-bold text-neutral-900 mb-4 leading-tight">
                  {isRtl ? 'انضم إلى زينا اليوم' : 'Join Zinea Today'}
                </h1>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  {isRtl 
                    ? 'اكتشف عالماً من المنتجات الفريدة أو ابدأ رحلتك في البيع عبر الإنترنت'
                    : 'Discover a world of unique products or start your online selling journey'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">
                      {isRtl ? 'تسجيل سريع وآمن' : 'Quick & Secure Registration'}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {isRtl ? 'سجل في دقائق واحصل على حسابك فوراً' : 'Sign up in minutes and get instant access'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">
                      {isRtl ? 'آلاف المنتجات' : 'Thousands of Products'}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {isRtl ? 'تصفح مجموعة واسعة من المنتجات عالية الجودة' : 'Browse a wide range of quality products'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">
                      {isRtl ? 'دعم على مدار الساعة' : '24/7 Support'}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {isRtl ? 'فريقنا جاهز لمساعدتك في أي وقت' : 'Our team is ready to help you anytime'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full">
              <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 lg:p-10">
                
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-6">
                  <Image src="/zlogo.svg" alt="Zinea" width={150} height={30} className="h-10 w-auto" />
                </div>

                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">
                    {isRtl ? 'إنشاء حساب جديد' : 'Create your account'}
                  </h2>
                  <p className="text-neutral-600">
                    {isRtl ? 'ابدأ رحلتك معنا في خطوات بسيطة' : 'Get started in just a few steps'}
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                  </div>
                )}

                {/* Step 1 — Choose account type */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="mb-6">
                      <p className="text-sm font-medium text-neutral-700 mb-4">
                        {isRtl ? 'اختر نوع الحساب' : 'Choose account type'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectType('customer')}
                      className="w-full flex items-center gap-4 p-6 border-2 border-neutral-200 rounded-xl hover:border-primary hover:bg-pink-50/50 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 group-hover:from-primary group-hover:to-pink-500 flex items-center justify-center transition-all">
                        <ShoppingBag className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-neutral-900 text-lg mb-1">
                          {isRtl ? 'حساب متسوق' : 'Customer Account'}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {isRtl ? 'تصفح واشترِ المنتجات المفضلة لديك' : 'Browse and purchase your favorite products'}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSelectType('seller')}
                      className="w-full flex items-center gap-4 p-6 border-2 border-neutral-200 rounded-xl hover:border-neutral-900 hover:bg-neutral-50 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-50 group-hover:from-neutral-900 group-hover:to-neutral-700 flex items-center justify-center transition-all">
                        <Store className="w-7 h-7 text-neutral-700 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-neutral-900 text-lg mb-1">
                          {isRtl ? 'حساب بائع' : 'Seller Account'}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {isRtl ? 'افتح متجرك الخاص وابدأ البيع' : 'Open your store and start selling'}
                        </p>
                      </div>
                    </button>

                    <div className="pt-6 text-center">
                      <p className="text-sm text-neutral-600">
                        {isRtl ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                        <Link href={`/${locale}/login`} className="font-semibold text-primary hover:text-pink-600 transition-colors">
                          {isRtl ? 'تسجيل الدخول' : 'Sign in'}
                        </Link>
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2 — Registration Form */}
                {step === 2 && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(''); setAccountType(null); }}
                      className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors mb-4"
                    >
                      <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                      {isRtl ? 'رجوع' : 'Back'}
                    </button>

                    {/* Account Type Badge */}
                    <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                      {accountType === 'seller' ? (
                        <Store className="w-5 h-5 text-neutral-700" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-primary" />
                      )}
                      <div>
                        <p className="text-xs text-neutral-500 font-medium">
                          {isRtl ? 'نوع الحساب' : 'Account Type'}
                        </p>
                        <p className="text-sm font-semibold text-neutral-900">
                          {accountType === 'seller'
                            ? (isRtl ? 'بائع' : 'Seller')
                            : (isRtl ? 'متسوق' : 'Customer')}
                        </p>
                      </div>
                    </div>

                    {/* Store Name — sellers only */}
                    {accountType === 'seller' && (
                      <div>
                        <label className="block text-sm font-semibold text-neutral-900 mb-2">
                          {isRtl ? 'اسم المتجر' : 'Store Name'}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                          <input
                            type="text"
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 transition-colors text-neutral-900"
                            placeholder={isRtl ? 'متجر الورود' : 'My Flower Shop'}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        {isRtl ? 'رقم الهاتف' : 'Phone Number'}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 transition-colors text-neutral-900"
                          placeholder="+966 50 123 4567"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        {isRtl ? 'كلمة المرور' : 'Password'}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-12 pr-12 py-3.5 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 transition-colors text-neutral-900"
                          placeholder="••••••••"
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength === 'weak' ? 'bg-red-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : passwordStrength === 'strong' ? 'bg-green-500' : 'bg-neutral-200'}`} />
                            <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength === 'medium' || passwordStrength === 'strong' ? passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500' : 'bg-neutral-200'}`} />
                            <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-neutral-200'}`} />
                          </div>
                          <p className="text-xs text-neutral-600">
                            {passwordStrength === 'weak' && (isRtl ? 'ضعيفة' : 'Weak')}
                            {passwordStrength === 'medium' && (isRtl ? 'متوسطة' : 'Medium')}
                            {passwordStrength === 'strong' && (isRtl ? 'قوية' : 'Strong')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-2">
                        {isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full pl-12 pr-12 py-3.5 border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 transition-colors text-neutral-900"
                          placeholder="••••••••"
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {isRtl ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-neutral-900 to-neutral-700 text-white py-4 rounded-xl font-bold text-base hover:from-neutral-800 hover:to-neutral-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neutral-900/20 mt-6"
                    >
                      {loading
                        ? (isRtl ? 'جاري إنشاء الحساب...' : 'Creating account...')
                        : (isRtl ? 'إنشاء حساب' : 'Create Account')}
                    </button>

                    {/* Sign In Link */}
                    <div className="pt-4 text-center">
                      <p className="text-sm text-neutral-600">
                        {isRtl ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                        <Link href={`/${locale}/login`} className="font-semibold text-primary hover:text-pink-600 transition-colors">
                          {isRtl ? 'تسجيل الدخول' : 'Sign in'}
                        </Link>
                      </p>
                    </div>
                  </form>
                )}
              </div>

              {/* Terms */}
              <p className="text-center text-xs text-neutral-500 mt-6 px-4">
                {isRtl 
                  ? 'بإنشاء حساب، فإنك توافق على '
                  : 'By creating an account, you agree to our '}
                <Link href={`/${locale}/terms`} className="text-neutral-700 hover:text-neutral-900 underline">
                  {isRtl ? 'الشروط والأحكام' : 'Terms & Conditions'}
                </Link>
                {isRtl ? ' و' : ' and '}
                <Link href={`/${locale}/privacy`} className="text-neutral-700 hover:text-neutral-900 underline">
                  {isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
