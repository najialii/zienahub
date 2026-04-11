import { useLocale } from 'next-intl';
import { cookies } from 'next/headers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeaturedSubcategories from '@/components/FeaturedSubcategories';
import CategoryScroll from '@/components/CategoryScroll';
import TenantCarousel from '@/components/TenantCarouselClient';
import BannerSlider from '@/components/BannerSlider';
import { subcategoriesApi, tenantsApi } from '@/lib/server/api';
import { getFullImageUrl } from '@/lib/imageUtils';

// Server component for fetching featured subcategories
async function getFeaturedSubcategories(locale: string) {
  try {
    const result = await subcategoriesApi.getFeatured(locale);
    if (result.success) {
      return result.data.map(subcategory => ({
        ...subcategory,
        products: subcategory.products.map(product => ({
          ...product,
          image_url: getFullImageUrl(product.image_url),
        })),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching featured subcategories:', error);
    return [];
  }
}

// Server component for fetching tenants
async function getTenants() {
  try {
    return await tenantsApi.getAll();
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return [];
  }
}

// Get auth token from cookies for Header
async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || null;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const localeStr = locale as 'en' | 'ar';

  // Fetch data in parallel on the server
  const [featuredSubcategories, tenants, authToken] = await Promise.all([
    getFeaturedSubcategories(localeStr),
    getTenants(),
    getAuthToken(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header authToken={authToken} />

      <main className="flex-1">
        {/* Hero Section - Banner Slider */}
        <div className="bg-neutral-50">
          <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
            {/* BannerSlider is a client component that shows multiple banners with navigation */}
            <BannerSlider
              type="promotional"
              position="top"
              height="lg"
              autoPlay={true}
              autoPlayInterval={5000}
              className="shadow-xl"
            />
          </div>
        </div>

        {/* Category Scroll - Horizontal categories under hero */}
        <CategoryScroll locale={localeStr} />

        {/* Tenant Carousel - Client component for interactivity */}
        <div className="relative py-8">
          <div className="container mx-auto px-4 mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              {localeStr === 'en' ? 'Our Partners' : 'شركاؤنا'}
            </h2>
          </div>
          <div className="relative">
            <TenantCarousel initialTenants={tenants} />
          </div>
        </div>

        {featuredSubcategories.length > 0 && (
          <FeaturedSubcategories initialData={featuredSubcategories} locale={localeStr} />
        )}
      </main>

      <Footer />
    </div>
  );
}