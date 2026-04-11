'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

interface TenantCarouselClientProps {
  initialTenants: Tenant[];
}

export default function TenantCarouselClient({ initialTenants }: TenantCarouselClientProps) {
  const locale = useLocale() as 'en' | 'ar';
  const [currentIndex, setCurrentIndex] = useState(0);
  const isRTL = locale === 'ar';

  const getVisibleItems = useCallback(() => {
    if (typeof window === 'undefined') return 2;
    const width = window.innerWidth;
    if (width >= 1280) return 8; // NiceOne shows many small logos
    if (width >= 1024) return 6;
    if (width >= 768) return 4;
    return 3;
  }, []);

  const [visibleItems, setVisibleItems] = useState(getVisibleItems);

  useEffect(() => {
    const handleResize = () => setVisibleItems(getVisibleItems());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleItems]);

  const maxIndex = Math.max(0, initialTenants.length - visibleItems);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  if (initialTenants.length === 0) return null;

  return (
    <div className="relative w-full group px-4 md:px-0">
      {/* Navigation Buttons - Smaller and cleaner like NiceOne */}
      {initialTenants.length > visibleItems && (
        <>
          <button
            onClick={isRTL ? goToNext : goToPrevious}
            disabled={currentIndex === 0}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-neutral-100 disabled:opacity-0 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <button
            onClick={isRTL ? goToPrevious : goToNext}
            disabled={currentIndex >= maxIndex}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-neutral-100 disabled:opacity-0 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </button>
        </>
      )}

      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(${isRTL ? '' : '-'}${currentIndex * (100 / visibleItems)}%)` 
          }}
        >
          {initialTenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/${locale}/tenants/${tenant.slug}`}
              className="flex-shrink-0 flex flex-col items-center px-2"
              style={{ width: `${100 / visibleItems}%` }}
            >
              {/* Logo Circle */}
              <div className="relative w-full aspect-square max-w-[120px] rounded-full bg-white border border-neutral-100 flex items-center justify-center p-4 transition-all duration-300 hover:shadow-md hover:border-neutral-200">
                {tenant.logo ? (
                  <img
                    src={tenant.logo}
                    alt={tenant.name}
                    className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all"
                  />
                ) : (
                  <div className="text-neutral-400 font-bold text-lg">
                    {tenant.name.charAt(0)}
                  </div>
                )}
              </div>
              
        <span className="mt-3 text-[11px] font-bold text-neutral-500 uppercase tracking-tighter text-center line-clamp-1">
                {tenant.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}