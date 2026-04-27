'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ShoppingBag, Heart, User, Menu } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useCartStore } from '@/lib/cartStore';
import { useUserStore } from '@/lib/userStore';
import { useWishlistStore } from '@/lib/wishlistStore';
import { usePlatformRefresh } from '@/hooks/usePlatformRefresh';
import { searchProducts } from '@/app/[locale]/actions';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import Price from './Price';
import Megamenu from './Megamenu';

interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  subcategories?: any[];
  image_url?: string;
}

export default function Header({ 
  authToken: initialAuthToken,
  categories = [] // 
}: { 
  authToken?: string | null;
  categories?: Category[]; 
}) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const { openCart, getTotalItems } = useCartStore();
  const { openWishlist, getTotalItems: getWishlistTotal } = useWishlistStore();
  const { profile, isLoggedIn } = useUserStore();

  usePlatformRefresh();
  const totalItems = getTotalItems();
  const wishlistTotal = getWishlistTotal();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  }, [searchQuery, locale, router]);

  const handleSuggestionClick = (productSlug: string) => {
    router.push(`/${locale}/products/${productSlug}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    try {
      const result = await searchProducts(query, locale as 'en' | 'ar');
      if (result.success && result.products) {
        setSuggestions(result.products);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  }, [locale]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <div className="bg-neutral-900 py-2 text-center">
        <p className="text-white text-xs md:text-sm font-medium tracking-wide">
          {locale === 'ar' ? 'استخدم كود ' : 'Use code '}
          <span className="text-pink-400 font-bold mx-1">NEW20</span>
          {locale === 'ar' ? 'لخصم 20٪ على طلبك الأول' : 'for 20% OFF your first order'}
        </p>
      </div>

      <div className="bg-white py-5 md:py-7">
        <div className="container mx-auto px-4 flex items-center justify-between gap-8 md:gap-16">
          <Link href={`/${locale}`} className="flex-shrink-0">
            <Image 
              src="/zlogo.svg" 
              alt="Zeina" 
              width={300} 
              height={100} 
              className="h-14 md:h-20 w-auto object-contain" 
              priority 
            />
          </Link>

          <div className="flex-1 max-w-5xl hidden md:block relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                placeholder={locale === 'en' ? 'What are you looking for?' : 'عن ماذا تبحث؟'}
                className="w-full bg-[#f3f4f6] border-none rounded-lg px-12 py-3.5 text-sm transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-neutral-100 outline-none"
              />
              <Search className={`absolute ${locale === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-black transition-colors`} />
              <div className={`absolute ${locale === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2`}>
                {isSearching && <div className="w-4 h-4 border-2 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />}
              </div>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-100 shadow-2xl z-[60] rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map((p) => (
                  <button key={p.id} onClick={() => handleSuggestionClick(p.slug)} className="w-full flex items-center gap-5 p-4 hover:bg-neutral-50 text-left transition-colors border-b border-neutral-50 last:border-0">
                    <div className="w-14 h-14 relative flex-shrink-0 bg-neutral-50 rounded-lg overflow-hidden">
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{p.name}</p>
                      <Price amount={p.price} className="text-sm text-neutral-600 font-bold mt-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 shadow-sm" onMouseLeave={() => setShowMegaMenu(false)}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <nav className="flex items-center h-full gap-8">
              <div className="h-full flex items-center" onMouseEnter={() => setShowMegaMenu(true)}>
                <button className="flex items-center gap-3 text-sm font-bold text-neutral-900 group h-full px-2">
                  <Menu className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="hidden sm:inline uppercase tracking-widest">{locale === 'ar' ? 'الفئات' : 'Categories'}</span>
                </button>
              </div>
              
              <div className="hidden lg:flex items-center gap-10 h-full">
                {['Perfumes', 'Makeup', 'Care', 'Sale'].map((link) => (
                   <Link key={link} href="#" className="text-xs font-bold text-neutral-500 hover:text-black transition-colors uppercase tracking-widest relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-black hover:after:w-full after:transition-all">
                      {link}
                   </Link>
                ))}
              </div>
            </nav>

            <div className="flex items-center gap-2 md:gap-4">
              <Link href={isLoggedIn ? `/${locale}/account` : `/${locale}/login`} className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 rounded-full transition-all">
                <User className="w-5 h-5 text-neutral-800" />
                <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">
                  {isLoggedIn ? (profile?.name?.split(' ')[0] || t('account')) : t('account')}
                </span>
              </Link>

              <button onClick={openWishlist} className="relative p-2.5 hover:bg-neutral-50 rounded-full group transition-all">
                <Heart className="w-5 h-5 text-neutral-800 group-hover:fill-neutral-800 transition-all" />
                {mounted && wishlistTotal > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold px-1">
                    {wishlistTotal}
                  </span>
                )}
              </button>

              <div className="w-[1px] h-6  mx-1 hidden md:block" />

              <button onClick={openCart} className="flex items-center gap-3 px-2 py-2.5   rounded-full  transition-all  active:scale-95">
                <div className="relative">
                  <ShoppingBag className="w-5 text-primary h-5" />
                  {mounted && totalItems > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-pink-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-bold px-1 border-2 border-neutral-900">
                      {totalItems}
                    </span>
                  )}
                </div>
                {/* <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">{t('cart')}</span> */}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu Overlay */}
        {showMegaMenu && (
          <div className="absolute top-full left-0 w-full animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xl">
             {/* 3. Pass the categories prop to the Megamenu */}
             <Megamenu categories={categories} />
          </div>
        )}
      </header>
    </>
  );
}