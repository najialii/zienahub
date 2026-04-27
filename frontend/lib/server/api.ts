/**
 * BFF (Backend for Frontend) Layer
 * * This module provides server-side data fetching functions that can be called
 * from React Server Components. It handles authentication, caching, and
 * proper error handling.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Build headers for API requests
 * Handles locale and authentication
 */
function buildHeaders(options?: { locale?: string; token?: string }) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // Force Laravel to return JSON errors instead of HTML
  };

  if (options?.locale) {
    headers['Accept-Language'] = options.locale;
  }

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  return headers;
}

/**
 * Generic fetch function for server-side requests
 */
async function fetchFromApi<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    locale?: string;
    token?: string;
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
    revalidate?: number | false;
  } = {},
): Promise<T> {
  const { method = 'GET', locale, token, body, params, revalidate = 60 } = options;

  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }

  // Ensure there is a proper slash between API_URL and endpoint
  const safeEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const url = `${API_URL}${safeEndpoint}${queryString}`;

  const response = await fetch(url, {
    method,
    headers: buildHeaders({ locale, token }),
    body: body ? JSON.stringify(body) : undefined,
    next: { revalidate },
  });

  if (!response.ok) {
    const errorText = await response.text();
    
    // Check if the response is actually a Laravel HTML error page
    if (errorText.includes('<!DOCTYPE html>')) {
      throw new Error(`404 Not Found: The API route "${url}" does not exist on the server.`);
    }

    let errorMessage = `API request failed with status ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

// ==================== Home Sections ====================

export const homeSectionsApi = {
  getAll: async () => {
    // Standardizing to use the helper function for consistency
    return fetchFromApi<{ success: boolean; data: any[] }>('/home-sections', { 
      revalidate: 3600 
    });
  },
};


export interface Subcategory {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  image_url?: string;
  subcategories?: Subcategory[];
}

export const categoriesApi = {
  getAll: async (locale: string = 'en', revalidate?: number) =>
    fetchFromApi<Category[]>(
      '/categories',
      { locale, revalidate },
    ),

  getById: async (id: number, locale: string = 'en') =>
    fetchFromApi<Category>(
      `/categories/${id}`,
      { locale },
    ),

  getBySlug: async (slug: string, locale: string = 'en') =>
    fetchFromApi<Category>(
      `/categories/slug/${slug}`,
      { locale },
    ),
};

// ==================== Products ====================

export interface ServerProduct {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  description: string;
  description_ar: string;
  price: number;
  sale_price?: number;
  image_url: string;
  status: string;
  stock_quantity: number;
  sku: string;
  category?: { id: number; name: string; name_ar: string; slug?: string };
  subcategory?: { id: number; name: string; name_ar: string; slug?: string };
  created_at: string;
  updated_at: string;
}

export const productsApi = {
  getAll: async (locale: string = 'en', params?: Record<string, string | number | boolean | undefined>, revalidate: number | false = 60) =>
    fetchFromApi<ServerProduct[]>('/products', { locale, params, revalidate }),

  getById: async (id: number, locale: string = 'en') =>
    fetchFromApi<ServerProduct>(`/products/${id}`, { locale }),

  getBySlug: async (slug: string, locale: string = 'en') =>
    fetchFromApi<ServerProduct>(`/products/slug/${slug}`, { locale }),

  getRelated: async (slug: string, locale: string = 'en', revalidate: number | false = 300) =>
    fetchFromApi<ServerProduct[]>(`/products/slug/${slug}/related`, { locale, revalidate }),

  search: async (query: string, locale: string = 'en', revalidate: number | false = 60) =>
    fetchFromApi<ServerProduct[]>('/products', { locale, params: { search: query }, revalidate }),
};

// ==================== Subcategories ====================

export interface ServerSubcategory {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  description?: string;
  description_ar?: string;
  category_id: number;
  featured_sort_order: number;
  category: { id: number; name: string; name_ar: string };
  products: ServerProduct[];
}

export const subcategoriesApi = {
  getFeatured: async (locale: string = 'en', revalidate: number | false = 300) =>
    fetchFromApi<{ success: boolean; data: ServerSubcategory[] }>('/subcategories/featured', {
      locale,
      revalidate,
    }),
};

// ==================== Tenants ====================

export interface ServerTenant {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  cover_image: string | null;
  description: string | null;
}

export const tenantsApi = {
  getAll: async (revalidate: number | false = 300) => {
    const result = await fetchFromApi<{ data: ServerTenant[] }>('/tenants', { revalidate });
    return result.data || [];
  },

  getById: async (id: number) =>
    fetchFromApi<ServerTenant>(`/tenants/${id}`),

  getBySlug: async (slug: string, revalidate: number | false = 300) =>
    fetchFromApi<ServerTenant>(`/tenants/${slug}`, { revalidate }),
};

// ==================== Banners ====================

export interface ServerBanner {
  id: number;
  title: string;
  title_ar: string;
  image: string;
  link?: string;
  position: string;
  sort_order: number;
  is_active: boolean;
}

export const bannersApi = {
  getAll: async (locale: string = 'en', type?: string, position?: string, revalidate: number | false = 300) =>
    fetchFromApi<ServerBanner[]>('/banners', {
      locale,
      params: { type, position },
      revalidate,
    }),

  getByType: async (type: string, locale: string = 'en', position?: string, revalidate: number | false = 300) =>
    fetchFromApi<ServerBanner[]>(`/banners/type/${type}`, {
      locale,
      params: { position },
      revalidate,
    }),
};

// ==================== Cart (Server-side) ====================

export interface CartItem {
  id: number;
  product: ServerProduct;
  quantity: number;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total: number;
}

export const cartApi = {
  get: async (token: string) =>
    fetchFromApi<Cart>('/cart', { token }),

  addItem: async (productId: number, quantity: number, token: string) =>
    fetchFromApi<Cart>('/cart/items', {
      method: 'POST',
      token,
      body: { product_id: productId, quantity },
    }),

  updateItem: async (itemId: number, quantity: number, token: string) =>
    fetchFromApi<Cart>(`/cart/items/${itemId}`, {
      method: 'PUT',
      token,
      body: { quantity },
    }),

  removeItem: async (itemId: number, token: string) =>
    fetchFromApi<Cart>(`/cart/items/${itemId}`, {
      method: 'DELETE',
      token,
    }),
};

// ==================== Wishlist (Server-side) ====================

export interface WishlistItem {
  id: number;
  product: ServerProduct;
}

export const wishlistApi = {
  get: async (token: string) =>
    fetchFromApi<WishlistItem[]>('/wishlist', { token }),

  toggle: async (productId: number, token: string) =>
    fetchFromApi<{ added: boolean; wishlist: WishlistItem[] }>('/wishlist/toggle', {
      method: 'POST',
      token,
      body: { product_id: productId },
    }),
};

// ==================== Auth (Server-side) ====================

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export const authApi = {
  me: async (token: string) =>
    fetchFromApi<User>('/me', { token, revalidate: 0 }),
};

// ==================== Settings ====================

export interface PlatformSetting {
  key: string;
  value: string;
}

export const settingsApi = {
  getAll: async (revalidate: number | false = 300) =>
    fetchFromApi<PlatformSetting[]>('/settings', { revalidate }),
};

export default {
  homeSectionsApi,
  categoriesApi,
  productsApi,
  subcategoriesApi,
  tenantsApi,
  bannersApi,
  cartApi,
  wishlistApi,
  authApi,
  settingsApi,
};