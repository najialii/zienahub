'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerData {
  id: number;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  link_text?: string;
  link_text_ar?: string;
  background_color?: string;
  text_color?: string;
  text_alignment: string;
  is_active: boolean;
  sort_order: number;
}

interface BannerSliderProps {
  type?: string;
  position?: string;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  height?: 'sm' | 'md' | 'lg' | 'xl';
}

// Placeholder banners to show when no banners are available
const placeholderBanners: BannerData[] = [
  {
    id: 1,
    title: 'Welcome to Zeina',
    title_ar: 'مرحباً بكم في زينا',
    description: 'Discover our exclusive collection of premium products',
    description_ar: 'اكتشف مجموعتنا الحصرية من المنتجات الفاخرة',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
    link_url: '/en/products',
    link_text: 'Shop Now',
    link_text_ar: 'تسوق الآن',
    background_color: '#1a1a2e',
    text_color: '#ffffff',
    text_alignment: 'center',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    title: 'New Arrivals',
    title_ar: 'وصلنا حديثاً',
    description: 'Check out our latest products with up to 30% off',
    description_ar: 'تحقق من منتجاتنا الأحدث مع خصم يصل إلى 30%',
    image_url: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1200&h=400&fit=crop',
    link_url: '/en/products',
    link_text: 'Explore',
    link_text_ar: 'استكشف',
    background_color: '#16213e',
    text_color: '#ffffff',
    text_alignment: 'center',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    title: 'Free Shipping',
    title_ar: 'شحن مجاني',
    description: 'On all orders over 200 SAR',
    description_ar: 'على جميع الطلبات التي تزيد عن 200 ريال',
    image_url: 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=1200&h=400&fit=crop',
    link_url: '/en/products',
    link_text: 'Learn More',
    link_text_ar: 'اعرف المزيد',
    background_color: '#0f3460',
    text_color: '#ffffff',
    text_alignment: 'center',
    is_active: true,
    sort_order: 3,
  },
];

const heightClasses = {
  sm: 'h-48 md:h-56',
  md: 'h-64 md:h-80',
  lg: 'h-80 md:h-96',
  xl: 'h-96 md:h-[500px]',
};

export default function BannerSlider({
  type = 'promotional',
  position = 'top',
  className = '',
  autoPlay = true,
  autoPlayInterval = 5000,
  height = 'lg',
}: BannerSliderProps) {
  const locale = useLocale();
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const fetchBanners = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (position) params.append('position', position);

      const response = await fetch(`${API_BASE_URL}/banners?type=${type}&${params.toString()}`, {
        headers: {
          'Accept-Language': locale,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          const sortedBanners = result.data.sort((a: BannerData, b: BannerData) => a.sort_order - b.sort_order);
          setBanners(sortedBanners);
        } else {
          setBanners(placeholderBanners);
        }
      } else {
        setBanners(placeholderBanners);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners(placeholderBanners);
    } finally {
      setIsLoading(false);
    }
  }, [type, position, locale]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (!autoPlay || isHovering || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, banners.length, isHovering]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className={`relative w-full ${heightClasses[height]} bg-neutral-200 animate-pulse rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-neutral-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const bannerTitle = locale === 'ar' && currentBanner.title_ar ? currentBanner.title_ar : currentBanner.title;
  const bannerDescription = locale === 'ar' && currentBanner.description_ar ? currentBanner.description_ar : currentBanner.description;
  const bannerLinkText = locale === 'ar' && currentBanner.link_text_ar ? currentBanner.link_text_ar : currentBanner.link_text;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg shadow-lg ${heightClasses[height]} ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{
          backgroundImage: currentBanner.image_url ? `url(${currentBanner.image_url})` : `linear-gradient(135deg, ${currentBanner.background_color || '#1a1a2e'} 0%, #2d3748 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <img
          src={currentBanner.image_url}
          alt={bannerTitle}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.style.background = `linear-gradient(135deg, ${currentBanner.background_color || '#1a1a2e'} 0%, #2d3748 100%)`;
            }
          }}
        />
      </div>

      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* Content */}
      <div
        className={`absolute inset-0 flex items-center ${
          currentBanner.text_alignment === 'left'
            ? 'justify-start'
            : currentBanner.text_alignment === 'right'
            ? 'justify-end'
            : 'justify-center'
        }`}
      >
        <div
          className={`px-8 md:px-12 max-w-2xl ${
            currentBanner.text_alignment === 'left'
              ? 'text-left ml-8'
              : currentBanner.text_alignment === 'right'
              ? 'text-right mr-8'
              : 'text-center'
          }`}
        >
          <h2
            className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 drop-shadow-lg"
            style={{ color: currentBanner.text_color || '#ffffff' }}
          >
            {bannerTitle}
          </h2>
          {bannerDescription && (
            <p
              className="text-sm md:text-base lg:text-lg mb-4 md:mb-6 opacity-90 drop-shadow"
              style={{ color: currentBanner.text_color || '#ffffff' }}
            >
              {bannerDescription}
            </p>
          )}
          {currentBanner.link_url && bannerLinkText && (
            <Link
              href={currentBanner.link_url}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-900 hover:bg-neutral-100 transition-colors font-semibold text-sm md:text-base rounded-full shadow-lg hover:shadow-xl"
            >
              {bannerLinkText}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-neutral-800" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-neutral-800" />
          </button>
        </>
      )}

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6 md:w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}