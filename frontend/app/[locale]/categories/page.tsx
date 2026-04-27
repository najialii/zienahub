'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@/lib/types';

export default function CategoriesPage() {
  const locale = useLocale() as 'en' | 'ar';
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

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      
      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-medium mb-3 text-neutral-900">
                {locale === 'en' ? 'Shop by Category' : 'تسوق حسب الفئة'}
              </h1>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                {locale === 'en' 
                  ? 'Browse our collection of gifts and flowers'
                  : 'تصفح مجموعتنا من الهدايا والزهور'}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg border border-neutral-100 animate-pulse overflow-hidden">
                    <div className="w-full aspect-square bg-neutral-100"></div>
                    <div className="p-4">
                      <div className="h-3 bg-neutral-100 w-3/4 mb-2 rounded"></div>
                      <div className="h-3 bg-neutral-100 w-1/2 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/${locale}/categories/${category.slug}`}
                    className="group bg-white rounded-lg border border-neutral-100 overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-square bg-neutral-50 overflow-hidden">
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/400x400/f5f5f5/cccccc/?text=${encodeURIComponent(category.name)}`;
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm md:text-base mb-1 text-neutral-900 group-hover:text-neutral-700 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-neutral-600 line-clamp-2">{category.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
