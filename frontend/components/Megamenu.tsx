'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Tag as TagIcon } from 'lucide-react';
import { useLocale } from 'next-intl';

interface Subcategory {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  subcategories?: Subcategory[];
  image_url?: string;
}

interface Tag {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  type: string;
  is_active: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function Megamenu({ categories = [] }: { categories: Category[] }) {
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<Category | null>(categories[0] || null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Fetch featured tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tags`);
        const data = await response.json();
        if (data.success && data.data) {
          setTags(data.data.slice(0, 8)); // Limit to 8 tags
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  // Sync active category if categories are loaded late
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  return (
    <div className="absolute top-full left-0 w-full bg-white border-b border-neutral-100 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 z-50 overflow-hidden">
      <div className="container mx-auto flex h-[500px]">
        
        {/* Sidebar: Categories */}
        <div className="w-1/4 border-r border-neutral-50 bg-neutral-50/50 overflow-y-auto py-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onMouseEnter={() => setActiveCategory(cat)}
              className={`w-full flex items-center justify-between px-6 py-4 text-sm font-bold transition-all ${
                activeCategory?.id === cat.id 
                  ? 'bg-white text-black border-l-4 border-black' 
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              <span>{locale === 'ar' ? cat.name_ar : cat.name}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${locale === 'ar' ? 'rotate-180' : ''} ${activeCategory?.id === cat.id ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </div>

        {/* Content: Subcategories and Featured Tags */}
        <div className="flex-1 bg-white p-10 overflow-y-auto">
          {activeCategory && (
            <div className="grid grid-cols-3 gap-10">
              <div className="col-span-2 grid grid-cols-2 gap-8">
                
                {/* Subcategories List */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-neutral-100 pb-2">
                    {locale === 'ar' ? 'الأقسام الفرعية' : 'Subcategories'}
                  </h3>
                  <ul className="space-y-4">
                    {activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
                      activeCategory.subcategories.map((sub) => (
                        <li key={sub.id}>
                          <Link 
                            href={`/${locale}/categories/${activeCategory.slug}/${sub.slug}`}
                            className="text-sm text-neutral-600 hover:text-pink-500 transition-colors block group flex items-center gap-2"
                          >
                            <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${locale === 'ar' ? 'rotate-180' : ''}`} />
                            {locale === 'ar' ? sub.name_ar : sub.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-neutral-400 italic">
                        {locale === 'ar' ? 'لا توجد أقسام فرعية' : 'No subcategories'}
                      </li>
                    )}
                  </ul>
                </div>

                {/* Featured Tags */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-neutral-100 pb-2 flex items-center gap-2">
                    <TagIcon className="w-4 h-4" />
                    {locale === 'ar' ? 'مميز' : 'Featured'}
                  </h3>
                  {loadingTags ? (
                    <div className="text-sm text-neutral-400 italic">
                      {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                  ) : tags.length > 0 ? (
                    <ul className="space-y-4">
                      {tags.map((tag) => (
                        <li key={tag.id}>
                          <Link 
                            href={`/${locale}/products?tag=${tag.id}`}
                            className="text-sm text-neutral-600 hover:text-pink-500 transition-colors group flex items-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {locale === 'ar' ? tag.name_ar : tag.name_en}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-neutral-400 italic">
                      {locale === 'ar' ? 'لا توجد علامات مميزة' : 'No featured tags'}
                    </div>
                  )}
                </div>
              </div>

              {/* Promo Image */}
              <div className="col-span-1">
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden group shadow-lg">
                  <Image 
                    src={activeCategory.image_url || '/placeholder-cat.jpg'} 
                    alt={activeCategory.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                    <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">
                      {locale === 'ar' ? 'اكتشف' : 'Explore'}
                    </p>
                    <h4 className="text-white text-xl font-black italic">
                      {locale === 'ar' ? activeCategory.name_ar : activeCategory.name}
                    </h4>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}