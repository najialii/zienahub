'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface BannerData {
  id: number;
  title: string;
  description: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  link_text?: string;
  background_color?: string;
  text_color?: string;
  text_alignment: string;
}

interface BannerProps {
  type: 'promotional' | 'category_banner' | 'sidebar_banner' | 'footer_banner';
  position?: 'top' | 'middle' | 'bottom' | 'left' | 'right' | 'center';
  className?: string;
  limit?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function Banner({ type, position, className = '', limit }: BannerProps) {
  const locale = useLocale();
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const params = new URLSearchParams();
        if (position) params.append('position', position);

        const response = await fetch(`${API_BASE_URL}/banners/type/${type}?${params}`, {
          headers: {
            'Accept-Language': locale,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            let bannersData = result.data || [];
            if (limit) {
              bannersData = bannersData.slice(0, limit);
            }
            setBanners(bannersData);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${type} banners:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [type, position, locale, limit]);

  if (loading) {
    return null;
  }

  if (banners.length === 0) {
    return null;
  }

  if (type === 'sidebar_banner') {
    return (
      <div className={`space-y-4 ${className}`}>
        
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="relative overflow-hidden rounded-lg shadow-sm w-full"
            style={{ backgroundColor: banner.background_color || '#f8f9fa' }}
          >
            {banner.image_url && (
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div 
                className={`text-center p-4 ${
                  banner.text_alignment === 'left' ? 'text-left' :
                  banner.text_alignment === 'right' ? 'text-right' :
                  'text-center'
                }`}
              >
                <h3 
                  className="text-lg font-bold mb-2"
                  style={{ color: banner.text_color || '#ffffff' }}
                >
                  {banner.title}
                </h3>
                {banner.description && (
                  <p 
                    className="text-sm mb-3 opacity-90"
                    style={{ color: banner.text_color || '#ffffff' }}
                  >
                    {banner.description}
                  </p>
                )}
                {banner.link_url && banner.link_text && (
                  <Link
                    href={banner.link_url}
                    className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    style={{ color: banner.text_color || '#ffffff' }}
                  >
                    {banner.link_text}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`w-full ${className} ${banners.length > 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="relative overflow-hidden rounded-3xl shadow-sm w-full"
          style={{ backgroundColor: banner.background_color || '#f8f9fa' }}
        >
          {banner.image_url && (
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-40 md:h-56 lg:h-64 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-60" />
            <div className="absolute top-1/4 left-4 w-16 h-16 bg-white/30 rounded-full blur-2xl" />
            <div className="absolute bottom-1/4 left-8 w-12 h-12 bg-white/20 rounded-full blur-xl" />
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-l from-white/20 via-transparent to-transparent opacity-60" />
            <div className="absolute top-1/3 right-6 w-20 h-20 bg-white/25 rounded-full blur-3xl" />
          </div>

          <div className="absolute inset-0 bg-black/20 flex items-center">
            <div 
              className={`p-8 md:p-12 w-full ${
                banner.text_alignment === 'left' ? 'text-left' :
                banner.text_alignment === 'right' ? 'text-right' :
                'text-center'
              }`}
            >
              <h3 
                className="text-2xl md:text-3xl lg:text-4xl font-black mb-3 leading-tight tracking-tight drop-shadow-md"
                style={{ color: banner.text_color || '#ffffff' }}
              >
                {banner.title}
              </h3>
              {banner.description && (
                <p 
                  className="text-sm md:text-lg mb-6 opacity-95 font-medium max-w-lg drop-shadow-sm inline-block"
                  style={{ color: banner.text_color || '#ffffff' }}
                >
                  {banner.description}
                </p>
              )}
              <div className="block">
                {banner.link_url && banner.link_text && (
                  <Link
                    href={banner.link_url}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-neutral-900 hover:bg-[#E42E59] hover:text-white transition-all font-bold text-sm md:text-base rounded-full shadow-lg active:scale-95"
                  >
                    {banner.link_text}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}