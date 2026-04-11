'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { productsApi } from '@/lib/api';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

interface RelatedProductsProps {
  productSlug: string;
}

export default function RelatedProducts({ productSlug }: RelatedProductsProps) {
  const locale = useLocale() as 'en' | 'ar';
  const t = useTranslations('product');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const data = await productsApi.getRelated(productSlug, locale);
        setRelatedProducts(data as Product[]);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      fetchRelatedProducts();
    }
  }, [productSlug, locale]);

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            {t('youMayAlsoLike')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!relatedProducts.length) {
    return null;
  }

  return (
    <div className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center text-neutral-900">
          {t('youMayAlsoLike')}
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            /* Using the reusable ProductCard component for consistent UI */
            <ProductCard 
              key={product.id} 
              product={product} 
              locale={locale} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
