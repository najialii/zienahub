'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@/lib/types';

export default function CategoriesGrid() {
  const locale = useLocale() as 'en' | 'ar';
  const t = useTranslations('common');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll(locale);
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [locale]);

  if (loading) {
    return (
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-8 tracking-tight text-neutral-900">
            {locale === 'en' ? 'Shop by Category' : 'تسوق حسب الفئة'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-white border border-neutral-200 p-6 animate-pulse"
              >
                <div className="w-full h-32 bg-neutral-100 mb-4"></div>
                <div className="h-4 bg-neutral-100 w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight">
          {locale === 'en' ? 'Shop by Category' : 'تسوق حسب الفئة'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/${locale}/categories/${category.slug}`}
              className="group bg-white overflow-hidden hover:shadow-sm transition-all"
            >
              <div className="relative h-48 bg-neutral-50 overflow-hidden">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/400x300/f3f4f6/000000/?text=${encodeURIComponent(category.name)}`;
                  }}
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-semibold text-base mb-1 text-black">{category.name}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
