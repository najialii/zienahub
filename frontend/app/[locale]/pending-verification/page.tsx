'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Clock, LogOut } from 'lucide-react';
import { useUserStore } from '@/lib/userStore';
import Image from 'next/image';

export default function PendingVerificationPage() {
  const locale = useLocale();
  const router = useRouter();
  const { logout, profile } = useUserStore();
  const isRtl = locale === 'ar';

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/login`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <Image src="/zlogo.svg" alt="Zinea" width={400} height={60} className="h-14 w-auto mx-auto mb-6" />

        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>

        <h1 className="text-xl font-bold text-neutral-900 mb-2">
          {isRtl ? 'في انتظار المراجعة' : 'Pending Verification'}
        </h1>

        <p className="text-neutral-500 text-sm mb-6">
          {isRtl
            ? 'تم استلام طلبك. سيقوم فريقنا بمراجعة متجرك والتواصل معك قريباً.'
            : 'Your application has been received. Our team will review your store and get back to you shortly.'}
        </p>

        {profile?.name && (
          <p className="text-sm text-neutral-400 mb-6">
            {isRtl ? `مرحباً، ${profile.name}` : `Hi, ${profile.name}`}
          </p>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700 mb-6">
          {isRtl
            ? 'ستتلقى إشعاراً عند الموافقة على حسابك. يمكنك تسجيل الدخول مرة أخرى للتحقق من الحالة.'
            : 'You will be notified once your account is approved. You can log back in to check your status.'}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mx-auto text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {isRtl ? 'تسجيل الخروج' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}
