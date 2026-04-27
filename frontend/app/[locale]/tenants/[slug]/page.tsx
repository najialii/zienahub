'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ShoppingBag, Phone, Star, Share2, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductFilters, { FilterState } from '@/components/ProductFilters';
import { tenantsApi, productsApi } from '@/lib/api';
import type { Product } from '@/lib/types';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  cover_image?: string;
}

export default function TenantPage() {
  const params = useParams();
  const slug = params.slug as string;
  const locale = (params.locale as string) || 'en';
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    tags: [],
    priceRange: { min: 0, max: 1000 },
    sortBy: 'newest',
    inStock: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tenant by slug
        const tenantData = await tenantsApi.getBySlug(slug) as Tenant;
        
        if (!tenantData) {
          setLoading(false);
          return;
        }
        
        // Fetch products for this tenant
        const productsData = await productsApi.getAll(locale as 'en' | 'ar', { tenant_slug: slug }) as Product[];
        
        setTenant(tenantData);
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, locale]);

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
    
    let filtered = [...products];

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => {
        const categoryId = typeof p.category === 'object' ? p.category?.id : null;
        return categoryId && filters.categories.includes(categoryId);
      });
    }

    // Apply subcategory filter
    if (filters.subcategories.length > 0) {
      filtered = filtered.filter(p => {
        const subcategoryId = typeof p.subcategory === 'object' ? p.subcategory?.id : p.subcategory_id;
        return subcategoryId && filters.subcategories.includes(subcategoryId);
      });
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(p => p.tag_id && filters.tags.includes(p.tag_id));
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
    }

    setFilteredProducts(filtered);
  };

  const activeFiltersCount = 
    activeFilters.categories.length + 
    activeFilters.subcategories.length + 
    activeFilters.tags.length + 
    (activeFilters.inStock ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-xl font-bold text-neutral-900 mb-4">
            {locale === 'en' ? 'Store Not Found' : 'المتجر غير موجود'}
          </h1>
          <Link href={`/${locale}`} className="text-primary font-bold underline">
            {locale === 'en' ? 'Back to Home' : 'العودة للرئيسية'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      
      {/* Cover Area */}
      <div className="relative h-[180px] md:h-[280px] bg-neutral-100">
        {tenant.cover_image && (
          <img
            src={tenant.cover_image}
            alt={tenant.name}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Navigation Overlays */}
        <div className="absolute top-4 start-4 z-10">
          <Link
            href={`/${locale}`}
            className="flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-neutral-900 hover:bg-white transition-all"
          >
            <ChevronLeft className={`w-6 h-6 ${locale === 'ar' ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative -mt-12 md:-mt-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-8">
            
            <div className="flex flex-col md:flex-row items-center md:items-end gap-5">
              {/* Logo */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden bg-white shadow-xl border-[6px] border-white">
                {tenant.logo ? (
                  <img src={tenant.logo} alt={tenant.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400 font-black text-4xl">
                    {tenant.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Title & Stats */}
              <div className="text-center md:text-start mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight mb-2">
                  {tenant.name}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
                    <span className="text-sm font-black text-neutral-800">4.8</span>
                    <span className="text-xs text-neutral-400 font-bold">(1.2k)</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span className="text-sm font-bold text-neutral-500">
                    {products.length} {locale === 'en' ? 'Products' : 'منتج'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-pink-100 transition-transform active:scale-95">
                <Phone className="w-4 h-4" />
                {locale === 'en' ? 'Contact' : 'تواصل'}
              </button>
              <button className="p-3 bg-neutral-50 rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Description Bio */}
          {tenant.description && (
            <div className="pb-6 max-w-3xl">
              <p className="text-neutral-500 text-sm leading-relaxed">
                {tenant.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Products Section with Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">
              {locale === 'en' ? 'Products' : 'المنتجات'}
            </h2>
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
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale as 'en' | 'ar'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <ShoppingBag className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {locale === 'en' ? 'No Products Found' : 'لم يتم العثور على منتجات'}
                </h3>
                <button
                  onClick={() => handleFilterChange({
                    categories: [],
                    subcategories: [],
                    tags: [],
                    priceRange: { min: 0, max: 1000 },
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
    </div>
  );
}
