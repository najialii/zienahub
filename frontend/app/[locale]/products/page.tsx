'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProductFilters, { FilterState } from '@/components/ProductFilters';
import { productsApi } from '@/lib/api';
import type { Product } from '@/lib/types';

export default function ProductsPage() {
  const locale = useLocale() as 'en' | 'ar';
  const t = useTranslations('product');
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const tagParam = searchParams.get('tag') || '';
  const subcategoryParam = searchParams.get('subcategory') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: [],
    priceRange: { min: 0, max: 1000 },
    colors: [],
    occasions: [],
    sortBy: 'newest',
    inStock: false,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getAll(locale);
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [locale]);

  // Apply search, tag, and subcategory filters when they change
  useEffect(() => {
    if ((searchQuery || tagParam || subcategoryParam) && products.length > 0) {
      let filtered = [...products];
      
      // Apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.slug.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply tag filter by tag_id
      if (tagParam) {
        const tagId = parseInt(tagParam);
        if (!isNaN(tagId)) {
          filtered = filtered.filter(p => p.tag_id === tagId);
        }
      }
      
      // Apply subcategory filter by subcategory_id
      if (subcategoryParam) {
        const subcategoryId = parseInt(subcategoryParam);
        if (!isNaN(subcategoryId)) {
          filtered = filtered.filter(p => p.subcategory_id === subcategoryId);
        }
      }
      
      setFilteredProducts(filtered);
    } else if (!searchQuery && !tagParam && !subcategoryParam) {
      // Re-apply filters if no search query, tag, or subcategory filter
      handleFilterChange(activeFilters);
    }
  }, [searchQuery, tagParam, subcategoryParam, products]);

  // Helper function to get keywords for tag filtering
  const getTagKeywords = (tagSlug: string): string[] => {
    const tagKeywordMap: { [key: string]: string[] } = {
      'mothers-day': ['mother', 'mom', 'rose', 'flower', 'bouquet'],
      'fathers-day': ['father', 'dad', 'perfume', 'cologne'],
      'birthday': ['birthday', 'celebration', 'gift', 'chocolate'],
      'anniversary': ['anniversary', 'wedding', 'luxury', 'jewelry'],
      'graduation': ['graduation', 'corporate', 'executive'],
      'wedding': ['wedding', 'luxury', 'hamper', 'elegant'],
      'mother': ['mother', 'mom', 'rose', 'perfume', 'jewelry'],
      'father': ['father', 'dad', 'perfume', 'oud', 'cologne'],
      'wife': ['wife', 'woman', 'rose', 'perfume', 'jewelry', 'elegant'],
      'husband': ['husband', 'man', 'perfume', 'oud', 'executive'],
      'girlfriend': ['girlfriend', 'woman', 'chocolate', 'perfume', 'rose'],
      'boyfriend': ['boyfriend', 'man', 'perfume', 'cologne'],
      'sister': ['sister', 'woman', 'jewelry', 'perfume', 'chocolate'],
      'brother': ['brother', 'man', 'perfume', 'chocolate'],
      'friend': ['friend', 'chocolate', 'gift'],
      'luxury': ['luxury', 'premium', 'executive', 'jewelry', 'hamper'],
      'elegant': ['elegant', 'jewelry', 'rose', 'luxury'],
      'romantic': ['romantic', 'rose', 'love'],
    };
    
    return tagKeywordMap[tagSlug] || [tagSlug];
  };

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
    
    let filtered = [...products];

    // Apply search filter first if there's a search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.slug.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => {
        const categorySlug = typeof p.category === 'object' ? p.category?.slug : '';
        return filters.categories.some(cat => 
          categorySlug?.includes(cat) || p.slug?.includes(cat)
        );
      });
    }

    // Apply price range filter
    filtered = filtered.filter(p => 
      p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
    );

    // Apply in stock filter
    if (filters.inStock) {
      filtered = filtered.filter(p => p.stock_quantity && p.stock_quantity > 0);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'popular':
        // Sort by a popularity metric if available
        break;
      case 'rating':
        // Sort by rating if available
        break;
    }

    setFilteredProducts(filtered);
  };

  const activeFiltersCount = 
    activeFilters.categories.length + 
    activeFilters.colors.length + 
    activeFilters.occasions.length + 
    (activeFilters.inStock ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-medium text-neutral-900 mb-1">
                {searchQuery 
                  ? (locale === 'en' ? `Search Results for "${searchQuery}"` : `نتائج البحث عن "${searchQuery}"`)
                  : tagParam
                  ? (locale === 'en' ? `Products with Tag` : `منتجات بالعلامة`)
                  : subcategoryParam
                  ? (locale === 'en' ? `Products in Subcategory` : `منتجات في الفئة الفرعية`)
                  : (locale === 'en' ? 'All Products' : 'جميع المنتجات')
                }
              </h1>
              <p className="text-sm text-neutral-600">
                {filteredProducts.length} {locale === 'en' ? 'products found' : 'منتج'}
              </p>
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {locale === 'en' ? 'Filters' : 'التصفية'}
              {activeFiltersCount > 0 && (
                <span className="bg-neutral-900 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-6">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <ProductFilters onFilterChange={handleFilterChange} />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6">
                  {[...Array(12)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl border border-neutral-100 overflow-hidden skeleton">
                      <div className="w-full aspect-[3/4] bg-neutral-200"></div>
                      <div className="p-3 sm:p-4">
                        <div className="h-4 bg-neutral-200 w-3/4 mb-3 rounded"></div>
                        <div className="h-4 bg-neutral-200 w-1/2 mb-3 rounded"></div>
                        <div className="h-6 bg-neutral-200 w-full rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale={locale}
                      size="medium"
                      showRating={true}
                      translations={{
                        inStock: t('inStock'),
                        outOfStock: t('outOfStock'),
                        addToCart: t('addToCart'),
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-neutral-600 mb-4">
                    {locale === 'en' ? 'No products found matching your filters' : 'لم يتم العثور على منتجات مطابقة'}
                  </p>
                  <button
                    onClick={() => handleFilterChange({
                      categories: [],
                      priceRange: { min: 0, max: 1000 },
                      colors: [],
                      occasions: [],
                      sortBy: 'newest',
                      inStock: false,
                    })}
                    className="text-sm text-neutral-900 hover:underline"
                  >
                    {locale === 'en' ? 'Clear all filters' : 'مسح جميع الفلاتر'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <ProductFilters 
              onFilterChange={handleFilterChange} 
              onClose={() => setShowMobileFilters(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
