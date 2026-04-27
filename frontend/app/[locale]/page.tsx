import { useLocale } from 'next-intl';
import { cookies } from 'next/headers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DynamicHomeSection from '@/components/DynamicHomeSection';
import { subcategoriesApi, tenantsApi, categoriesApi, homeSectionsApi, productsApi } from '@/lib/server/api';
import { getFullImageUrl } from '@/lib/imageUtils';

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

async function getTenants() {
  try {
    return await tenantsApi.getAll();
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return [];
  }
}

async function getHomeSections() {
  try {
    const response = await homeSectionsApi.getAll();
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching home sections:', error);
    return [];
  }
}

async function getProducts() {
  try {
    return await productsApi.getAll();
  } catch (error) {
    return [];
  }
}

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || null;
}

async function getCategories(locale: string) {
  try {
    const result = await categoriesApi.getAll(locale);
    return result || [];
  } catch (error) {
    console.error('Error fetching categories for megamenu:', error);
    return [];
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const localeStr = locale as 'en' | 'ar';

  const [featuredSubcategories, tenants, authToken, categories, homeSections, products] = await Promise.all([
    getFeaturedSubcategories(localeStr),
    getTenants(),
    getAuthToken(),
    getCategories(localeStr),
    getHomeSections(),
    getProducts()
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* <Header authToken={authToken} categories={categories} /> */}

      <main className="flex-1">
        {homeSections.length > 0 ? (
          homeSections.map((section: any) => (
            <DynamicHomeSection
              key={section.id}
              section={section}
              products={products}
              tenants={tenants}
              featuredSubcategories={featuredSubcategories}
              categories={categories}
            />
          ))
        ) : (
          <div className="flex justify-center py-20 text-gray-500">
            {localeStr === 'en' ? 'No home sections configured.' : 'لم يتم تكوين أقسام للصفحة الرئيسية.'}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}