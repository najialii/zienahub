# Server Components & BFF Migration Guide

## Overview

This document describes the migration from client-side data fetching with `useEffect` to React Server Components with a BFF (Backend for Frontend) pattern.

## Architecture Changes

### Before (Client-Side Fetching)
```
Browser → Next.js Client Component → useEffect → API Call → Laravel Backend
                                      ↓
                              Loading State (spinner)
                                      ↓
                              Data Display
```

### After (Server Components + BFF)
```
Browser → Next.js Server Component → BFF Layer → Laravel Backend
                     ↓
            Pre-rendered HTML with data
                     ↓
            Hydration (minimal JS)
```

## Key Components

### 1. BFF Layer (`frontend/lib/server/api.ts`)

The BFF layer provides server-side data fetching functions that:
- Run on the server (Node.js)
- Use Next.js caching and revalidation
- Handle authentication via cookies
- Provide type-safe API responses

**Example:**
```typescript
// Server-side fetch with caching
export const productsApi = {
  getAll: async (locale: string = 'en', params?: Record<string, string | number | boolean | undefined>, revalidate: number | false = 60) =>
    fetchFromApi<ServerProduct[]>('/products', { locale, params, revalidate }),
};
```

### 2. Server Actions (`frontend/app/[locale]/actions.ts`)

Server actions handle mutations (POST, PUT, DELETE) and are called from client components:

```typescript
'use server';

export async function addToCart(productId: number, quantity: number = 1): Promise<CartActionResult> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: 'Authentication required' };
  }

  const cart = await cartApi.addItem(productId, quantity, token);
  revalidatePath('/'); // Clear cache
  
  return { success: true, cart };
}
```

### 3. Server Components

**Home Page (`frontend/app/[locale]/page.tsx`):**
- Fetches all data on the server
- Passes data to client components as props
- No loading states needed (data is already available)

```typescript
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Parallel data fetching on server
  const [featuredSubcategories, tenants, authToken] = await Promise.all([
    getFeaturedSubcategories(locale),
    getTenants(),
    getAuthToken(),
  ]);

  return (
    <div>
      <Header authToken={authToken} />
      <FeaturedSubcategories initialData={featuredSubcategories} locale={locale} />
      <TenantCarousel initialTenants={tenants} />
    </div>
  );
}
```

### 4. Client Components (Interactive Parts)

Components that need interactivity remain as client components but receive data as props:

- **Header**: Search, cart, user menu (needs user interaction)
- **TenantCarouselClient**: Carousel navigation (needs state)
- **CategoryScrollClient**: Horizontal scrolling (needs user interaction)
- **ProductCard**: Add to cart buttons (needs interaction)

## Migration Pattern

### Step 1: Create Server Component Wrapper
```typescript
// CategoryScroll.tsx (Server Component)
import { categoriesApi } from '@/lib/server/api';
import CategoryScrollClient from './CategoryScrollClient';

async function getCategories(locale: string) {
  const categories = await categoriesApi.getAll(locale);
  return categories;
}

export default async function CategoryScroll({ locale }: { locale: string }) {
  const categories = await getCategories(locale);
  return <CategoryScrollClient categories={categories} />;
}
```

### Step 2: Create Client Component
```typescript
// CategoryScrollClient.tsx (Client Component)
'use client';

export default function CategoryScrollClient({ categories }: { categories: Category[] }) {
  // Interactive logic here (scrolling, etc.)
  return (
    <div>
      {categories.map(category => (
        <Link href={`/categories/${category.slug}`}>
          {category.name}
        </Link>
      ))}
    </div>
  );
}
```

## Benefits

### 1. **Better Performance**
- Data fetched on server (faster connection)
- HTML sent pre-rendered
- Less JavaScript shipped to client
- Better Core Web Vitals

### 2. **Improved SEO**
- Content is in initial HTML
- No flash of loading states
- Better indexing by search engines

### 3. **Simpler Code**
- No loading states for initial data
- No useEffect for data fetching
- No client-side caching complexity
- Clear separation of concerns

### 4. **Better Security**
- API keys stay on server
- Authentication handled securely
- Sensitive data not exposed to client

## Caching Strategy

### Server-Side Caching
```typescript
// Cache for 60 seconds by default
fetchFromApi('/products', { revalidate: 60 })

// Cache for 5 minutes
fetchFromApi('/products', { revalidate: 300 })

// No caching (real-time data)
fetchFromApi('/products', { revalidate: 0 })
```

### On-Demand Revalidation
```typescript
// After a mutation, clear the cache
export async function addToCart(productId: number) {
  // ... add to cart logic
  revalidatePath('/'); // Clear all caches
  // or
  revalidatePath('/cart'); // Clear specific path
}
```

## File Structure

```
frontend/
├── app/
│   └── [locale]/
│       ├── page.tsx                    # Server Component (home page)
│       ├── actions.ts                  # Server Actions (mutations)
│       └── layout.tsx                  # Root layout
├── components/
│   ├── CategoryScroll.tsx              # Server Component wrapper
│   ├── CategoryScrollClient.tsx        # Client Component
│   ├── FeaturedSubcategories.tsx       # Server Component (now accepts props)
│   ├── TenantCarouselClient.tsx        # Client Component
│   └── Header.tsx                      # Client Component (updated)
├── lib/
│   ├── server/
│   │   ├── api.ts                      # BFF Layer
│   │   └── index.ts                    # Exports
│   └── api.ts                          # Client-side API (legacy)
└── types/
    └── types.ts                        # Shared types
```

## Migration Checklist

### Completed ✅
- [x] Created BFF layer (`lib/server/api.ts`)
- [x] Created server actions (`app/[locale]/actions.ts`)
- [x] Converted home page to server component
- [x] Converted FeaturedSubcategories to server component
- [x] Created TenantCarouselClient component
- [x] Updated Header to use server actions for search
- [x] Created CategoryScrollClient component
- [x] Converted CategoryScroll to server component wrapper
- [x] Fixed type compatibility issues

### Future Work
- [ ] Convert product detail pages to server components
- [ ] Convert category pages to server components
- [ ] Convert admin pages to server components
- [ ] Add more server actions for other mutations
- [ ] Optimize caching strategies per endpoint
- [ ] Add error boundaries for server components
- [ ] Implement streaming for large datasets

## Best Practices

### 1. **Use Server Components by Default**
Only use client components when you need:
- User interaction (onClick, onChange, etc.)
- State management (useState, useReducer)
- Browser APIs (localStorage, window, etc.)
- Effects (useEffect, useLayoutEffect)

### 2. **Pass Data as Props**
Server components fetch data and pass it to client components:
```typescript
// Server Component
const data = await fetchData();
return <ClientComponent data={data} />;

// Client Component
export default function ClientComponent({ data }: { data: DataType }) {
  // Use data directly, no need to fetch
}
```

### 3. **Use Server Actions for Mutations**
Instead of API routes, use server actions:
```typescript
// In client component
<form action={addToCart}>
  <button type="submit">Add to Cart</button>
</form>

// In actions.ts
'use server';
export async function addToCart(formData: FormData) {
  // Handle mutation
}
```

### 4. **Optimize Caching**
Set appropriate revalidation times:
- Static data (categories): 300+ seconds
- Dynamic data (products): 60 seconds
- Real-time data (cart): 0 seconds

### 5. **Handle Errors Gracefully**
Use error boundaries and fallback UIs:
```typescript
// In server component
try {
  const data = await fetchData();
  return <Component data={data} />;
} catch (error) {
  return <ErrorFallback />;
}
```

## Testing

### Manual Testing Checklist
1. Home page loads without loading spinners
2. Search works and shows suggestions
3. Add to cart works
4. Wishlist toggle works
5. Category scroll works
6. Tenant carousel auto-rotates
7. Featured products display correctly
8. Arabic/English switching works

### Performance Testing
- Check Core Web Vitals in Lighthouse
- Verify Time to First Byte (TTFB) is low
- Check that HTML contains pre-rendered content
- Verify JavaScript bundle size is reduced

## Troubleshooting

### Issue: Data not showing
**Solution:** Check that server component is awaiting the data fetch and passing it to client component.

### Issue: Stale data
**Solution:** Add `revalidatePath()` call in server action after mutation.

### Issue: TypeScript errors
**Solution:** Ensure types match between server API response and component props.

### Issue: Hydration mismatch
**Solution:** Ensure server and client render the same initial UI (no random values, dates, etc.).

## Resources

- [React Server Components Documentation](https://react.dev/reference/react/use-server)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [BFF Pattern](https://samnewman.io/patterns/architectural/bff/)

## Conclusion

This migration significantly improves performance, SEO, and code maintainability by leveraging React Server Components and the BFF pattern. The application now fetches data on the server, sends pre-rendered HTML to clients, and uses server actions for mutations instead of client-side useEffect hooks.