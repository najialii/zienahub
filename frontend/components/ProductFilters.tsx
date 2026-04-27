'use client';

import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import Price from './Price';

interface Category {
  id: number;
  name: string;
  name_ar?: string;
  slug: string;
}

interface Subcategory {
  id: number;
  name: string;
  name_ar?: string;
  slug: string;
  category_id?: number;
}

interface Tag {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
}

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  onClose?: () => void;
  isMobile?: boolean;
  categories?: Category[];
  subcategories?: Subcategory[];
  tags?: Tag[];
  priceRange?: { min: number; max: number };
}

export interface FilterState {
  categories: number[];
  subcategories: number[];
  tags: number[];
  priceRange: { min: number; max: number };
  sortBy: string;
  inStock: boolean;
}

export default function ProductFilters({ 
  onFilterChange, 
  onClose, 
  isMobile = false,
  categories = [],
  subcategories = [],
  tags = [],
  priceRange = { min: 0, max: 1000 }
}: FilterProps) {
  const locale = useLocale();
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    tags: [],
    priceRange: priceRange,
    sortBy: 'newest',
    inStock: false,
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    subcategory: false,
    tag: false,
    price: true,
  });

  // Update price range when prop changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: priceRange
    }));
  }, [priceRange.min, priceRange.max]);

  const sortOptions = [
    { id: 'newest', name: locale === 'en' ? 'Newest First' : 'الأحدث أولاً' },
    { id: 'price-low', name: locale === 'en' ? 'Price: Low to High' : 'السعر: من الأقل للأعلى' },
    { id: 'price-high', name: locale === 'en' ? 'Price: High to Low' : 'السعر: من الأعلى للأقل' },
    { id: 'popular', name: locale === 'en' ? 'Most Popular' : 'الأكثر شعبية' },
    { id: 'rating', name: locale === 'en' ? 'Highest Rated' : 'الأعلى تقييماً' },
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryChange = (categoryId: number) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId];
    
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSubcategoryChange = (subcategoryId: number) => {
    const newSubcategories = filters.subcategories.includes(subcategoryId)
      ? filters.subcategories.filter(s => s !== subcategoryId)
      : [...filters.subcategories, subcategoryId];
    
    const newFilters = { ...filters, subcategories: newSubcategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagChange = (tagId: number) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(t => t !== tagId)
      : [...filters.tags, tagId];
    
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newFilters = {
      ...filters,
      priceRange: { ...filters.priceRange, [type]: value }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleInStockChange = () => {
    const newFilters = { ...filters, inStock: !filters.inStock };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters: FilterState = {
      categories: [],
      subcategories: [],
      tags: [],
      priceRange: priceRange,
      sortBy: 'newest',
      inStock: false,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFiltersCount = 
    filters.categories.length + 
    filters.subcategories.length + 
    filters.tags.length + 
    (filters.inStock ? 1 : 0);

  return (
    <div className={`bg-white ${isMobile ? 'h-full overflow-y-auto' : 'rounded-lg border border-neutral-200'}`}>
      {/* Header */}
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
          {isMobile && onClose && (
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-semibold text-neutral-900 mb-3">
            {locale === 'en' ? 'Sort By' : 'ترتيب حسب'}
          </label>
          <select
            value={filters.sortBy}
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
              checked={filters.inStock}
              onChange={handleInStockChange}
              className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
            />
            <span className="text-sm font-medium text-neutral-700">
              {locale === 'en' ? 'In Stock Only' : 'المتوفر فقط'}
            </span>
          </label>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="text-sm font-semibold text-neutral-900">
                {locale === 'en' ? 'Categories' : 'الفئات'}
              </span>
              {expandedSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.category && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                    />
                    <span className="text-sm text-neutral-700">
                      {locale === 'ar' && category.name_ar ? category.name_ar : category.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('subcategory')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="text-sm font-semibold text-neutral-900">
                {locale === 'en' ? 'Subcategories' : 'الفئات الفرعية'}
              </span>
              {expandedSections.subcategory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.subcategory && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {subcategories.map(subcategory => (
                  <label key={subcategory.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.subcategories.includes(subcategory.id)}
                      onChange={() => handleSubcategoryChange(subcategory.id)}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                    />
                    <span className="text-sm text-neutral-700">
                      {locale === 'ar' && subcategory.name_ar ? subcategory.name_ar : subcategory.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('tag')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="text-sm font-semibold text-neutral-900">
                {locale === 'en' ? 'Tags' : 'العلامات'}
              </span>
              {expandedSections.tag ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.tag && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tags.map(tag => (
                  <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag.id)}
                      onChange={() => handleTagChange(tag.id)}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                    />
                    <span className="text-sm text-neutral-700">
                      {locale === 'ar' ? tag.name_ar : tag.name_en}
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
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
                />
                <span className="text-neutral-500">-</span>
                <input
                  type="number"
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
                />
              </div>
              <div className="text-xs text-neutral-500 flex items-center gap-1">
                <Price amount={filters.priceRange.min} showDecimals={false} symbolClassName="w-3 h-3" />
                {' - '}
                <Price amount={filters.priceRange.max} showDecimals={false} symbolClassName="w-3 h-3" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
