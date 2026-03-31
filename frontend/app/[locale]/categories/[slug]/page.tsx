'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { categoriesApi, productsApi } from '@/lib/api';
import type { Category, Product } from '@/lib/types';

export default function CategoryDetailPage() {
  const params = useParams();
  const locale = useLocale() as 'en' | 'ar';
  const t = useTranslations('product');
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slug = params.slug as string;
        const categoryData = await categoriesApi.getBySlug(slug, locale);
        setCategory(categoryData);

        // Fetch products for this category
        const allProducts = await productsApi.getAll(locale);
        const categoryProducts = allProducts.filter(
          (p: Product) => p.category?.slug === slug
        );
        setProducts(categoryProducts);
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 w-2/3 mb-12"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-96"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {locale === 'en' ? 'Category Not Found' : 'الفئة غير موجودة'}
            </h1>
            <p className="text-gray-600">
              {locale === 'en'
                ? 'The category you are looking for does not exist.'
                : 'الفئة التي تبحث عنها غير موجودة.'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Category Header */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              {category.name}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              {category.description}
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {locale === 'en'
                    ? 'No products found in this category.'
                    : 'لا توجد منتجات في هذه الفئة.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    translations={{
                      inStock: t('inStock'),
                      outOfStock: t('outOfStock'),
                      addToCart: t('addToCart'),
                    }}
                  />
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
