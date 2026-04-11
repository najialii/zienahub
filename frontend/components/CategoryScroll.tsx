import { categoriesApi } from '@/lib/server/api';
import CategoryScrollClient from './CategoryScrollClient';

async function getCategories(locale: string) {
  try {
    const categories = await categoriesApi.getAll(locale);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoryScroll({ locale }: { locale: string }) {
  const categories = await getCategories(locale);

  if (categories.length === 0) {
    return (
      <div className="flex gap-6 overflow-hidden px-6 py-8 bg-white">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-none w-24 md:w-32">
            <div className="aspect-square rounded-full bg-neutral-100 animate-pulse mb-3" />
            <div className="h-3 w-16 bg-neutral-100 animate-pulse mx-auto rounded" />
          </div>
        ))}
      </div>
    );
  }

  return <CategoryScrollClient categories={categories} />;
}