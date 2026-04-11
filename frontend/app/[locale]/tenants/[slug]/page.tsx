import { tenantsApi, productsApi } from '@/lib/server/api';
import { getFullImageUrl } from '@/lib/imageUtils';
import Link from 'next/link';
import { ChevronLeft, ShoppingBag, Phone, Star, Share2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';

interface TenantPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function getTenantData(slug: string, locale: string) {
  try {
    const tenant = await tenantsApi.getBySlug(slug);
    if (!tenant) return null;

    const products = await productsApi.getAll(locale, { tenant_slug: slug });
    
    return {
      tenant,
      products: products.map(product => ({
        ...product,
        image_url: getFullImageUrl(product.image_url),
      })),
    };
  } catch (error) {
    console.error('Error fetching tenant data:', error);
    return null;
  }
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { slug, locale } = await params;
  const data = await getTenantData(slug, locale);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-xl font-bold text-neutral-900 mb-4">
            {locale === 'en' ? 'Store Not Found' : 'المتجر غير موجود'}
          </h1>
          <Link href={`/${locale}`} className="text-[#E42E59] font-bold underline">
            {locale === 'en' ? 'Back to Home' : 'العودة للرئيسية'}
          </Link>
        </div>
      </div>
    );
  }

  const { tenant, products } = data;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Cover Area */}
      <div className="relative h-[180px] md:h-[280px] bg-[#F3F3F3]">
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
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8">
        <div className="relative -mt-12 md:-mt-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-8 border-b border-neutral-100">
          
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
          <div className="py-6 max-w-3xl">
            <p className="text-neutral-500 text-sm leading-relaxed">
              {tenant.description}
            </p>
          </div>
        )}
      </div>

      {/* Sticky Category/Filter bar (Visual placeholder for NiceOne style) */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-50 overflow-x-auto">
        <div className="max-w-[1240px] mx-auto px-4 lg:px-8 flex items-center gap-8 h-14">
          <button className="text-sm font-black text-neutral-900 border-b-2 border-neutral-900 h-full px-1">
            {locale === 'en' ? 'All' : 'الكل'}
          </button>
          <button className="text-sm font-bold text-neutral-400 hover:text-neutral-600 transition-colors whitespace-nowrap">
            {locale === 'en' ? 'New Arrivals' : 'وصلنا حديثاً'}
          </button>
          <button className="text-sm font-bold text-neutral-400 hover:text-neutral-600 transition-colors whitespace-nowrap">
            {locale === 'en' ? 'Best Sellers' : 'الأكثر مبيعاً'}
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1240px] mx-auto px-4 lg:px-8 py-10">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-12 gap-x-4 md:gap-x-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  sale_price: product.sale_price,
                  image_url: product.image_url,
                  stock_quantity: product.stock_quantity ?? 10,
                  sku: product.sku ?? '',
                  category: product.category,
                }}
                locale={locale as 'en' | 'ar'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 text-neutral-100 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-neutral-900">
              {locale === 'en' ? 'No Products Found' : 'لم يتم العثور على منتجات'}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}