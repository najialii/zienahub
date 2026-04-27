'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Price from '@/components/Price';
import { categoriesApi, productsApi } from '@/lib/api';
import type { Category, Product } from '@/lib/types';

interface Subcategory {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  category_id: number;
  category?: { id: number; name: string; slug: string };
}

interface GroupedProducts {
  [subcategorySlug: string]: Product[];
}

interface FilterState {
  subcategories: string[];
  priceRange: { min: number; max: number };
  sortBy: string;
  inStock: boolean;
}

export default function CategoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = useLocale() as 'en' | 'ar';
  const t = useTranslations('product');
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    subcategories: [],
    priceRange: { min: 0, max: 1000 },
    sortBy: 'newest',
    inStock: false,
  });
  
  const [expandedSections, setExpandedSections] = useState({
    subcategories: true,
    price: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch category details
        const categoryData = await categoriesApi.getBySlug(slug, locale) as Category;
        setCategory(categoryData);

        // Fetch all products and filter by category
        const allProducts = await productsApi.getAll(locale) as Product[];
        const categoryProducts = allProducts.filter(
          (p: Product) => p.category?.slug === slug || p.category?.id === categoryData.id
        );
        setProducts(categoryProducts);

        // Fetch subcategories for this category
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/subcategories`);
        if (!response.ok) {
          console.error('Failed to fetch subcategories:', response.status, response.statusText);
          // If subcategories API fails, show all products without grouping
          const ungrouped: GroupedProducts = { 'all': categoryProducts };
          setGroupedProducts(ungrouped);
          setSubcategories([]);
          setLoading(false);
          return;
        }
        const allSubcategories = await response.json() as Subcategory[];
        
        const categorySubcategories = allSubcategories.filter(
          (sc: Subcategory) => sc.category?.slug === slug || sc.category_id === categoryData.id
        );
        setSubcategories(categorySubcategories);

        // Group products by subcategory
        const grouped: GroupedProducts = {};
        
        // Initialize groups for each subcategory
        categorySubcategories.forEach(sc => {
          grouped[sc.slug] = [];
        });
        
        // Group products by their subcategory
        categoryProducts.forEach(product => {
          if (product.subcategory_id) {
            const subcategory = categorySubcategories.find(sc => sc.id === product.subcategory_id);
            if (subcategory) {
              grouped[subcategory.slug].push(product);
            } else {
              // Product has subcategory_id but it doesn't match any known subcategory
              // Put it in 'other' group
              if (!grouped['other']) grouped['other'] = [];
              grouped['other'].push(product);
            }
          } else {
            // Product has no subcategory, put it in 'other' group
            if (!grouped['other']) grouped['other'] = [];
            grouped['other'].push(product);
          }
        });

        setGroupedProducts(grouped);
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, locale]);

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
    
    let filtered = [...products];

    // Apply subcategory filter
    if (filters.subcategories.length > 0) {
      filtered = filtered.filter(p => {
        return filters.subcategories.some(sc => 
          p.subcategory_id?.toString() === sc || p.slug?.includes(sc)
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
        break;
      case 'rating':
        break;
    }

    // Re-group filtered products
    const grouped: GroupedProducts = {};
    subcategories.forEach(sc => {
      grouped[sc.slug] = [];
    });

    filtered.forEach(product => {
      if (product.subcategory_id) {
        const subcategory = subcategories.find(sc => sc.id === product.subcategory_id);
        if (subcategory) {
          grouped[subcategory.slug].push(product);
        } else {
          if (!grouped['other']) grouped['other'] = [];
          grouped['other'].push(product);
        }
      } else {
        if (!grouped['other']) grouped['other'] = [];
        grouped['other'].push(product);
      }
    });

    setGroupedProducts(grouped);
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    const newSubcategories = activeFilters.subcategories.includes(subcategoryId)
      ? activeFilters.subcategories.filter(sc => sc !== subcategoryId)
      : [...activeFilters.subcategories, subcategoryId];
    
    const newFilters = { ...activeFilters, subcategories: newSubcategories };
    setActiveFilters(newFilters);
    handleFilterChange(newFilters);
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newFilters = {
      ...activeFilters,
      priceRange: { ...activeFilters.priceRange, [type]: value }
    };
    setActiveFilters(newFilters);
    handleFilterChange(newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...activeFilters, sortBy };
    setActiveFilters(newFilters);
    handleFilterChange(newFilters);
  };

  const handleInStockChange = () => {
    const newFilters = { ...activeFilters, inStock: !activeFilters.inStock };
    setActiveFilters(newFilters);
    handleFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters: FilterState = {
      subcategories: [],
      priceRange: { min: 0, max: 1000 },
      sortBy: 'newest',
      inStock: false,
    };
    setActiveFilters(newFilters);
    handleFilterChange(newFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const activeFiltersCount = 
    activeFilters.subcategories.length + 
    (activeFilters.inStock ? 1 : 0);

  const sortOptions = [
    { id: 'newest', name: locale === 'en' ? 'Newest First' : 'الأحدث أولاً' },
    { id: 'price-low', name: locale === 'en' ? 'Price: Low to High' : 'السعر: من الأقل للأعلى' },
    { id: 'price-high', name: locale === 'en' ? 'Price: High to Low' : 'السعر: من الأعلى للأقل' },
    { id: 'popular', name: locale === 'en' ? 'Most Popular' : 'الأكثر شعبية' },
    { id: 'rating', name: locale === 'en' ? 'Highest Rated' : 'الأعلى تقييماً' },
  ];

  // Count total products across all subcategories
  const totalProducts = Object.values(groupedProducts).reduce((sum, prods) => sum + prods.length, 0);

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
        {/* <Header /> */}
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
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* <Header /> */}
      
      <main className="flex-1">
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-medium text-neutral-900 mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-neutral-600 max-w-3xl">
                {category.description}
              </p>
            )}
            <p className="text-sm text-neutral-500 mt-2">
              {totalProducts} {locale === 'en' ? 'products found' : 'منتج'}
            </p>
          </div>

          <div className="flex gap-6">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <div className="bg-white rounded-lg border border-neutral-200">
                  {/* Filter Header */}
                  <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-neutral-600" />
                      <h3 className="font-semibold text-neutral-900">
                        {locale === 'en' ? 'Filters' : 'التصفية'}
                      </h3>
                      {activeFiltersCount > 0 && (
                        <span className="bg-neutral-900 text-white text-xs px-2 py-0.5 rounded-full">
                          {activeFiltersCount}
                        </span>
                      )}
                    </div>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
                      >
                        {locale === 'en' ? 'Clear All' : 'مسح الكل'}
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-6">
                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-900 mb-3">
                        {locale === 'en' ? 'Sort By' : 'ترتيب حسب'}
                      </label>
                      <select
                        value={activeFilters.sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
                      >
                        {sortOptions.map(option => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* In Stock Only */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.inStock}
                          onChange={handleInStockChange}
                          className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                        />
                        <span className="text-sm font-medium text-neutral-700">
                          {locale === 'en' ? 'In Stock Only' : 'المتوفر فقط'}
                        </span>
                      </label>
                    </div>

                    {/* Subcategories */}
                    {subcategories.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleSection('subcategories')}
                          className="w-full flex items-center justify-between mb-3"
                        >
                          <span className="text-sm font-semibold text-neutral-900">
                            {locale === 'en' ? 'Subcategories' : 'الفئات الفرعية'}
                          </span>
                          {expandedSections.subcategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedSections.subcategories && (
                          <div className="space-y-2">
                            {subcategories.map(subcategory => (
                              <label key={subcategory.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={activeFilters.subcategories.includes(subcategory.slug)}
                                  onChange={() => handleSubcategoryChange(subcategory.slug)}
                                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                                />
                                <span className="text-sm text-neutral-700">
                                  {locale === 'en' ? subcategory.name : subcategory.name_ar}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price Range */}
                    <div>
                      <button
                        onClick={() => toggleSection('price')}
                        className="w-full flex items-center justify-between mb-3"
                      >
                        <span className="text-sm font-semibold text-neutral-900">
                          {locale === 'en' ? 'Price Range' : 'نطاق السعر'}
                        </span>
                        {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {expandedSections.price && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={activeFilters.priceRange.min}
                              onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                              placeholder="Min"
                              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
                            />
                            <span className="text-neutral-500">-</span>
                            <input
                              type="number"
                              value={activeFilters.priceRange.max}
                              onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                              placeholder="Max"
                              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
                            />
                          </div>
                          <div className="text-xs text-neutral-500 flex items-center gap-1">
                            <Price amount={activeFilters.priceRange.min} showDecimals={false} symbolClassName="w-3 h-3" />
                            {' - '}
                            <Price amount={activeFilters.priceRange.max} showDecimals={false} symbolClassName="w-3 h-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grouped by Subcategory */}
            <div className="flex-1">
              {Object.keys(groupedProducts).length > 0 ? (
                <div className="space-y-12">
                  {Object.entries(groupedProducts).map(([subcategorySlug, subcategoryProducts]) => {
                    // Skip empty groups
                    if (subcategoryProducts.length === 0) return null;
                    
                    // Get subcategory name
                    let subcategoryName = '';
                    if (subcategorySlug === 'other') {
                      subcategoryName = locale === 'en' ? 'Other Products' : 'منتجات أخرى';
                    } else {
                      const subcategory = subcategories.find(sc => sc.slug === subcategorySlug);
                      subcategoryName = locale === 'en' ? subcategory?.name || subcategorySlug : subcategory?.name_ar || subcategorySlug;
                    }

                    return (
                      <section key={subcategorySlug}>
                        <h2 className="text-xl font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                          {subcategoryName}
                          <span className="text-sm font-normal text-neutral-500 ml-2">
                            ({subcategoryProducts.length})
                          </span>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6">
                          {subcategoryProducts.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              locale={locale}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border border-neutral-200">
                  <p className="text-neutral-600 mb-4">
                    {locale === 'en' ? 'No products found in this category' : 'لم يتم العثور على منتجات في هذه الفئة'}
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-neutral-900 hover:underline"
                    >
                      {locale === 'en' ? 'Clear all filters' : 'مسح جميع الفلاتر'}
                    </button>
                  )}
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
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-neutral-600" />
                <h3 className="font-semibold text-neutral-900">
                  {locale === 'en' ? 'Filters' : 'التصفية'}
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="bg-neutral-900 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    {locale === 'en' ? 'Clear All' : 'مسح الكل'}
                  </button>
                )}
                <button onClick={() => setShowMobileFilters(false)} className="p-1 hover:bg-neutral-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-3">
                  {locale === 'en' ? 'Sort By' : 'ترتيب حسب'}
                </label>
                <select
                  value={activeFilters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
              </div>

              {/* In Stock Only */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeFilters.inStock}
                    onChange={handleInStockChange}
                    className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                  />
                  <span className="text-sm font-medium text-neutral-700">
                    {locale === 'en' ? 'In Stock Only' : 'المتوفر فقط'}
                  </span>
                </label>
              </div>

              {/* Subcategories */}
              {subcategories.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('subcategories')}
                    className="w-full flex items-center justify-between mb-3"
                  >
                    <span className="text-sm font-semibold text-neutral-900">
                      {locale === 'en' ? 'Subcategories' : 'الفئات الفرعية'}
                    </span>
                    {expandedSections.subcategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSections.subcategories && (
                    <div className="space-y-2">
                      {subcategories.map(subcategory => (
                        <label key={subcategory.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeFilters.subcategories.includes(subcategory.slug)}
                            onChange={() => handleSubcategoryChange(subcategory.slug)}
                            className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                          />
                          <span className="text-sm text-neutral-700">
                            {locale === 'en' ? subcategory.name : subcategory.name_ar}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price Range */}
              <div>
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <span className="text-sm font-semibold text-neutral-900">
                    {locale === 'en' ? 'Price Range' : 'نطاق السعر'}
                  </span>
                  {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.price && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={activeFilters.priceRange.min}
                        onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
                      />
                      <span className="text-neutral-500">-</span>
                      <input
                        type="number"
                        value={activeFilters.priceRange.max}
                        onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full font-medium shadow-lg hover:bg-neutral-800 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {locale === 'en' ? 'Filters' : 'التصفية'}
          {activeFiltersCount > 0 && (
            <span className="bg-white text-neutral-900 text-xs px-2 py-0.5 rounded-full font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      <Footer />
    </div>
  );
}