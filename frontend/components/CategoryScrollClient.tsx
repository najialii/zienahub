'use client';

import { useRef } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Category } from '@/lib/types';

interface CategoryScrollClientProps {
  categories: Category[];
}

export default function CategoryScrollClient({ categories }: CategoryScrollClientProps) {
  const locale = useLocale() as 'en' | 'ar';
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="group relative w-full bg-white py-8 border-b border-neutral-50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between px-6 mb-6">
          <h2 className="text-xl font-bold text-neutral-800">
            {locale === 'en' ? 'Shop by Category' : 'تسوق حسب الفئة'}
          </h2>
          <Link 
            href={`/${locale}/categories`}
            className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
          >
            {locale === 'en' ? 'View All' : 'عرض الكل'}
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 hidden group-hover:flex w-10 h-10 bg-white shadow-xl rounded-full items-center justify-center border border-neutral-100 transition-all hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 md:gap-10 overflow-x-auto px-6 no-scrollbar snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/categories/${category.slug}`}
                className="flex-none w-24 md:w-32 snap-start group/item text-center"
              >
                <div className="relative aspect-square mb-3 overflow-hidden rounded-full border border-neutral-100 bg-neutral-50 shadow-sm transition-all group-hover/item:shadow-md group-hover/item:border-pink-200">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-white to-neutral-50">
                      {/* ✨ */}
                    </div>
                  )}
                </div>
                
                <p className="text-sm font-semibold text-neutral-700 group-hover/item:text-pink-600 transition-colors truncate">
                  {locale === 'ar' && (category as any).name_ar ? (category as any).name_ar : category.name}
                </p>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 hidden group-hover:flex w-10 h-10 bg-white shadow-xl rounded-full items-center justify-center border border-neutral-100 transition-all hover:scale-110"
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}