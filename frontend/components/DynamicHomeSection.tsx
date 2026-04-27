// components/DynamicHomeSection.tsx
'use client';

import { useLocale } from 'next-intl';
import HeroSlider from './HeroGrid';
import Banner from './Banner';
import ProductRow from './ProductRow';
import FeaturedTags from './FeaturedTags';
import CategoryScrollClient from './CategoryScrollClient';
import FeaturedSubcategories from './FeaturedSubcategories';
import TenantCarousel from './TenantCarouselClient';
import BannerSlider from './BannerSlider';

const getColumnClass = (value?: number | string) => {
  const v = Number(value || 12);
  if (v <= 3) return 'md:col-span-3';
  if (v <= 4) return 'md:col-span-4';
  if (v <= 5) return 'md:col-span-5';
  if (v <= 6) return 'md:col-span-6';
  if (v <= 7) return 'md:col-span-7';
  if (v <= 8) return 'md:col-span-8';
  if (v <= 9) return 'md:col-span-9';
  if (v <= 10) return 'md:col-span-10';
  if (v <= 11) return 'md:col-span-11';
  return 'md:col-span-12';
};

interface HomeSectionProps {
  section: {
    id: number;
    name: string;
    type: string;
    title_en: string;
    title_ar: string;
    description_en?: string;
    description_ar?: string;
    settings: any;
    sort_order: number;
    is_active: boolean;
  };
  products?: any[];
  tenants?: any[];
  featuredSubcategories?: any[];
  categories?: any[];
}

export default function DynamicHomeSection({
  section,
  products = [],
  tenants = [],
  featuredSubcategories = [],
  categories = []
}: HomeSectionProps) {
  const locale = useLocale() as 'en' | 'ar';

  if (!section.is_active) {
    return null;
  }

  const title = locale === 'ar' ? section.title_ar : section.title_en;
  const description = locale === 'ar' ? section.description_ar : section.description_en;

  const renderBlock = (block: any, index: number) => {
    const type = block?.type || 'product_row';

    if (type === 'banner') {
      const bannerType = block?.banner_type || section.settings?.banner_type || 'promotional';
      const position = block?.position || section.settings?.position || 'top';
      const height = (block?.height || section.settings?.height || 'md') as 'sm' | 'md' | 'lg' | 'xl';
      const layout = block?.layout || 'single';
      const columns = Number(block?.columns || 2);

      if (layout === 'slider') {
        return (
          <BannerSlider
            key={`block-${index}`}
            type={bannerType}
            position={position}
            height={height}
            autoPlay={true}
            autoPlayInterval={5000}
            className="shadow-xl"
          />
        );
      }

      return (
        <Banner
          key={`block-${index}`}
          type={bannerType}
          position={position}
          className={layout === 'grid' ? `grid grid-cols-1 md:grid-cols-${Math.min(columns, 4)} gap-4` : ''}
        />
      );
    }

    const categoryFilter = block?.category_filter || section.settings?.category_filter;
    const productCount = Number(block?.product_count || section.settings?.product_count || 12);
    const bg = block?.background_color || section.settings?.background_color || 'bg-white';
    const blockTitle = locale === 'ar' ? (block?.title_ar || section.title_ar) : (block?.title_en || title);

    let filteredProducts = products;
    if (categoryFilter && categoryFilter !== 'featured') {
      filteredProducts = products.filter(p =>
        p.category?.slug?.includes(categoryFilter) ||
        p.subcategory?.slug?.includes(categoryFilter)
      );
    }

    filteredProducts = filteredProducts.slice(0, productCount);

    return (
      <ProductRow
        key={`block-${index}`}
        title={blockTitle}
        titleAr={block?.title_ar || section.title_ar}
        products={filteredProducts}
        categorySlug={categoryFilter || 'featured'}
        backgroundColor={bg}
      />
    );
  };

  switch (section.type) {
    case 'hero_slider':
      return (
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
          <HeroSlider />
        </div>
      );

    case 'banner':
      const bannerType = section.settings?.banner_type || 'promotional';
      const position = section.settings?.position || 'top';
      const layout = section.settings?.layout || 'grid';
      const columns = section.settings?.columns || 2;
      const height = section.settings?.height || 'lg';

      if (layout === 'slider') {
        return (
          <div className="bg-neutral-50 mb-0">
            <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
              <BannerSlider
                type={bannerType}
                position={position}
                height={height as 'sm' | 'md' | 'lg' | 'xl'}
                autoPlay={true}
                autoPlayInterval={5000}
                className="shadow-xl"
              />
            </div>
          </div>
        );
      }

      return (
        <div className="container mx-auto px-4 py-6">
          <Banner
            type={bannerType}
            position={position}
            className={layout === 'grid' ? `grid grid-cols-1 md:grid-cols-${Math.min(columns, 4)} gap-4` : ''}
          />
        </div>
      );

    case 'product_row':
      if (Array.isArray(section.settings?.layout_blocks) && section.settings.layout_blocks.length > 0) {
        return (
          <div className="container mx-auto px-2 md:px-4 py-4 md:py-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
              {section.settings.layout_blocks.map((block: any, idx: number) => (
                <div key={`${section.id}-${idx}`} className={`col-span-1 ${getColumnClass(block?.col_span)}`}>
                  {renderBlock(block, idx)}
                </div>
              ))}
            </div>
          </div>
        );
      }

      const filterType = section.settings?.filter_type || 'subcategory';
      const filterValue = section.settings?.filter_value;
      const productCount = section.settings?.product_count || 12;
      const bg = section.settings?.background_color || 'bg-white';

      let filteredProducts = products;
      
      if (filterType === 'tag' && filterValue) {
        // Filter by tag ID
        filteredProducts = products.filter(p => p.tag_id === parseInt(filterValue));
      } else if (filterType === 'subcategory' && filterValue) {
        // Filter by subcategory ID
        filteredProducts = products.filter(p => p.subcategory?.id === parseInt(filterValue));
      }

      filteredProducts = filteredProducts.slice(0, productCount);

      return (
        <ProductRow
          title={title}
          titleAr={section.title_ar}
          products={filteredProducts}
          categorySlug={filterValue || 'featured'}
          backgroundColor={bg}
          filterType={filterType}
          filterValue={filterValue}
        />
      );

    case 'tenant_carousel':
      return (
        <div className="relative py-8">
          <div className="container mx-auto px-4 mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
          </div>
          <TenantCarousel initialTenants={tenants} />
        </div>
      );

    case 'category_scroll':
      return <CategoryScrollClient categories={categories} />;

    case 'featured_subcategories':
      return featuredSubcategories.length > 0 ? (
        <FeaturedSubcategories initialData={featuredSubcategories} locale={locale} />
      ) : null;

    case 'featured_tags':
      return <FeaturedTags />;

    default:
      return null;
  }
}