'use client';

import { useRef } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/types';

interface ProductRowProps {
  title: string;
  titleAr: string;
  products: Product[];
  categorySlug: string;
  backgroundColor?: string;
  filterType?: 'tag' | 'subcategory';
  filterValue?: string;
}

export default function ProductRow({ title, titleAr, products, categorySlug, backgroundColor = 'bg-white', filterType, filterValue }: ProductRowProps) {
  const locale = useLocale() as 'en' | 'ar';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Determine the "View All" link based on filter type
  let viewAllLink = `/${locale}/products`;
  
  if (filterType === 'tag' && filterValue) {
    viewAllLink = `/${locale}/products?tag=${filterValue}`;
  } else if (filterType === 'subcategory' && filterValue) {
    viewAllLink = `/${locale}/products?subcategory=${filterValue}`;
  } else if (categorySlug && categorySlug !== 'featured') {
    viewAllLink = `/${locale}/products?category=${categorySlug}`;
  }

  const scrollAction = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className={`py-12 md:py-16 ${backgroundColor.startsWith('#') ? '' : backgroundColor}`} style={backgroundColor.startsWith('#') ? { backgroundColor } : {}}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-xl md:text-2xl font-bold ${backgroundColor !== 'bg-white' && backgroundColor !== '#ffffff' ? 'text-white' : 'text-neutral-900'}`}>
            {locale === 'en' ? title : titleAr}
          </h2>
          <Link
            href={viewAllLink}
            className={`text-sm font-semibold transition-colors flex items-center gap-1 group ${backgroundColor !== 'bg-white' && backgroundColor !== '#ffffff' ? 'text-white/90 hover:text-white' : 'text-primary hover:text-pink-600'}`}
          >
            {locale === 'en' ? 'View All' : 'عرض الكل'}
            <ChevronRight className={`w-3.5 h-3.5 group-hover:${locale === 'ar' ? '-translate-x-0.5' : 'translate-x-0.5'} transition-transform ${locale === 'ar' ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        {/* Carousel Grid */}
        <div className="relative group">
          <button
            onClick={() => scrollAction('left')}
            className={`absolute -left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-12 h-12 bg-white shadow-xl rounded-full items-center justify-center border border-neutral-100 transition-transform duration-300 hover:scale-110 opacity-0 group-hover:opacity-100`}
          >
            <ChevronLeft className="w-6 h-6 text-neutral-800" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory pt-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <div key={product.id} className="flex-none w-[160px] sm:w-[220px] md:w-[260px] snap-start">
                <ProductCard product={product} locale={locale} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollAction('right')}
            className={`absolute -right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex w-12 h-12 bg-white shadow-xl rounded-full items-center justify-center border border-neutral-100 transition-transform duration-300 hover:scale-110 opacity-0 group-hover:opacity-100`}
          >
            <ChevronRight className="w-6 h-6 text-neutral-800" />
          </button>
        </div>
      </div>
    </section>
  );
}
