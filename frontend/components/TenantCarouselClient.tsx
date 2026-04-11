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
  cover_image: string | null;
  description: string | null;
}

interface TenantCarouselClientProps {
  initialTenants: Tenant[];
}

export default function TenantCarouselClient({ initialTenants }: TenantCarouselClientProps) {
  const locale = useLocale() as 'en' | 'ar';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // FIXED: Initialize with a static value (matching server fallback) 
  // to ensure the first client render matches the server render.
  const [visibleItems, setVisibleItems] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getVisibleItems = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width >= 1280) return 5;
    if (width >= 1024) return 4;
    if (width >= 768) return 3;
    if (width >= 640) return 2;
    return 1;
  }, []);

  // FIXED: Handle window-dependent logic inside useEffect.
  // This ensures that state updates only after the component has "hydrated" on the client.
  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => setVisibleItems(getVisibleItems());
    
    // Set initial visible items on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleItems]);

  useEffect(() => {
    // Prevent interval if not mounted or not enough items
    if (!isMounted || isHovering || initialTenants.length <= visibleItems) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, initialTenants.length - visibleItems);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovering, initialTenants.length, visibleItems, isMounted]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    const maxIndex = Math.max(0, initialTenants.length - visibleItems);
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  if (initialTenants.length === 0) return null;

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Gradients and buttons... (kept same as your code) */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-50 via-neutral-50/80 to-transparent opacity-90" />
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-l from-neutral-50 via-neutral-50/80 to-transparent opacity-90" />
      </div>

      {isMounted && initialTenants.length > visibleItems && (
        <>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`absolute left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
              currentIndex === 0
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-50'
                : 'bg-white text-neutral-900 hover:bg-neutral-50 hover:scale-110 hover:shadow-xl'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex >= initialTenants.length - visibleItems}
            className={`absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
              currentIndex >= initialTenants.length - visibleItems
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-50'
                : 'bg-white text-neutral-900 hover:bg-neutral-50 hover:scale-110 hover:shadow-xl'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div className="overflow-hidden px-20">
        <div 
          className="flex gap-4 transition-transform duration-500 ease-out"
          style={{ 
            // FIXED: Using transform logic that only shifts if mounted 
            // to avoid server-client style mismatches.
            transform: isMounted ? `translateX(-${currentIndex * (100 / visibleItems)}%)` : 'translateX(0%)' 
          }}
        >
          {initialTenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/${locale}/tenants/${tenant.slug}`}
              className="flex-shrink-0 group"
              style={{ width: `${100 / visibleItems}%` }}
            >
              <div className="mx-2 bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:border-neutral-300 group-hover:-translate-y-1">
                <div className="relative h-24 md:h-32 overflow-hidden">
                  {tenant.cover_image ? (
                    <img
                      src={tenant.cover_image}
                      alt={tenant.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="relative px-4 pb-4 pt-0">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg border-4 border-white bg-white">
                      {tenant.logo ? (
                        <img
                          src={tenant.logo}
                          alt={tenant.name}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-white font-bold text-xl">
                          {getInitials(tenant.name)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-12 text-center">
                    <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 mb-1">
                      {tenant.name}
                    </h3>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FIXED: Wrapped pagination in isMounted to ensure the number of buttons matches. */}
      {isMounted && initialTenants.length > visibleItems && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(initialTenants.length / visibleItems) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * visibleItems)}
              className={`rounded-full transition-all ${
                Math.floor(currentIndex / visibleItems) === index
                  ? 'bg-neutral-900 w-8 h-2'
                  : 'bg-neutral-300 w-2 h-2 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}