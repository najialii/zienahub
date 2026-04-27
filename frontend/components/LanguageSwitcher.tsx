'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Check, ChevronDown } from 'lucide-react';

// SVG Flag Components
const UKFlag = () => (
  <svg className="w-5 h-4" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
    <clipPath id="t"><path d="M30,15 h30 v15 z v-30 h-30 z h-30 v15 z v-30 h30 z"/></clipPath>
    <g clipPath="url(#s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

const SaudiFlag = () => (
  <svg className="w-5 h-4" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#165B33"/>
    <g fill="#fff">
      <path d="M 450,300 m -150,0 a 150,150 0 1,0 300,0 a 150,150 0 1,0 -300,0" fill="none" stroke="#fff" strokeWidth="20"/>
      <text x="450" y="320" fontSize="120" textAnchor="middle" fontFamily="Arial" fontWeight="bold">لا إله إلا الله</text>
      <rect x="420" y="380" width="60" height="120" fill="#fff"/>
      <rect x="380" y="420" width="140" height="20" fill="#fff"/>
    </g>
  </svg>
);

export default function LanguageSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Replace the locale in the current pathname
    const segments = pathname.split('/').filter(Boolean);
    
    // Remove the current locale from segments if it exists
    if (segments[0] === locale) {
      segments.shift();
    }
    
    // Build new path with new locale
    const newPath = `/${newLocale}${segments.length > 0 ? '/' + segments.join('/') : ''}`;
    
    // Force a full page reload to apply dir attribute
    window.location.href = newPath;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
        disabled={isPending}
      >
        {locale === 'en' ? <UKFlag /> : <SaudiFlag />}
        <span className="hidden sm:inline">{locale === 'en' ? 'EN' : 'AR'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden z-[100]">
          <div className="py-1">
            <button
              onClick={() => switchLanguage('en')}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 transition-colors flex items-center gap-3 ${
                locale === 'en' ? 'bg-neutral-100 font-semibold' : ''
              }`}
            >
              <UKFlag />
              <span className="flex-1">{t('english')}</span>
              {locale === 'en' && (
                <Check className="w-4 h-4 text-neutral-900" />
              )}
            </button>
            <button
              onClick={() => switchLanguage('ar')}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 transition-colors flex items-center gap-3 ${
                locale === 'ar' ? 'bg-neutral-100 font-semibold' : ''
              }`}
            >
              <SaudiFlag />
              <span className="flex-1">{t('arabic')}</span>
              {locale === 'ar' && (
                <Check className="w-4 h-4 text-neutral-900" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[90]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
