const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const buildHeaders = (locale?: 'en' | 'ar') => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (locale) {
    headers['Accept-Language'] = locale;
  }

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const request = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  options: {
    locale?: 'en' | 'ar';
    body?: any;
    params?: Record<string, string | number | boolean | undefined>;
  } = {},
): Promise<T> => {
  const { locale, body, params } = options;
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }

  const url = `${API_URL}${endpoint}${searchParams.toString() ? `?${searchParams}` : ''}`;

  const response = await fetch(url, {
    method,
    headers: buildHeaders(locale),
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = JSON.stringify(errorJson);
    } catch {
      if (errorText) {
        errorMessage = errorText;
      }
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

export const categoriesApi = {
  getAll: async (locale: 'en' | 'ar' = 'en') => request('/categories', 'GET', { locale }),

  getById: async (id: number, locale: 'en' | 'ar' = 'en') => request(`/categories/${id}`, 'GET', { locale }),

  getBySlug: async (slug: string, locale: 'en' | 'ar' = 'en') => request(`/categories/slug/${slug}`, 'GET', { locale }),
};

export const productsApi = {
  getAll: async (locale: 'en' | 'ar' = 'en', params?: any) => request('/products', 'GET', { locale, params }),

  getById: async (id: number, locale: 'en' | 'ar' = 'en') => request(`/products/${id}`, 'GET', { locale }),

  getBySlug: async (slug: string, locale: 'en' | 'ar' = 'en') => request(`/products/slug/${slug}`, 'GET', { locale }),

  getRelated: async (slug: string, locale: 'en' | 'ar' = 'en') => request(`/products/slug/${slug}/related`, 'GET', { locale }),
};

export const cartApi = {
  get: async () => request('/cart', 'GET'),

  addItem: async (productId: number, quantity: number = 1) =>
    request('/cart/items', 'POST', { body: { product_id: productId, quantity } }),

  updateItem: async (itemId: number, quantity: number) =>
    request(`/cart/items/${itemId}`, 'PUT', { body: { quantity } }),

  removeItem: async (itemId: number) => request(`/cart/items/${itemId}`, 'DELETE'),
};

export const wishlistApi = {
  get: async () => request('/wishlist', 'GET'),

  toggle: async (productId: number) => request('/wishlist/toggle', 'POST', { body: { product_id: productId } }),
};

export const authApi = {
  login: async (email: string, password: string) => request('/login', 'POST', { body: { email, password } }),

  register: async (name: string, email: string, password: string) =>
    request('/register', 'POST', { body: { name, email, password } }),

  logout: async () => request('/logout', 'POST'),

  me: async () => request('/me', 'GET'),
};

export const bannersApi = {
  getAll: async (locale: 'en' | 'ar' = 'en', type?: string, position?: string) =>
    request('/banners', 'GET', {
      locale,
      params: {
        type,
        position,
      },
    }),

  getByType: async (type: string, locale: 'en' | 'ar' = 'en', position?: string) =>
    request(`/banners/type/${type}`, 'GET', {
      locale,
      params: {
        position,
      },
    }),
};

export const tenantsApi = {
  getAll: async () => request('/tenants', 'GET'),

  getById: async (id: number) => request(`/tenants/${id}`, 'GET'),
};

export default {
  request,
  categoriesApi,
  productsApi,
  cartApi,
  wishlistApi,
  authApi,
  bannersApi,
  tenantsApi,
};
