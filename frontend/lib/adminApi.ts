// Admin API Service for Zeina
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  status: 'active' | 'draft' | 'out-of-stock';
  sku: string;
  subcategory_id: number;
  created_at: string;
  updated_at: string;
  subcategory?: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
    };
  };
}

export interface ProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url?: string | null;
  status: 'active' | 'draft' | 'out-of-stock';
  sku: string;
  subcategory_id: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ProductFilters {
  search?: string;
  category_id?: number;
  subcategory_id?: number;
  status?: 'active' | 'draft' | 'out-of-stock';
  min_price?: number;
  max_price?: number;
  stock_status?: 'in-stock' | 'low-stock' | 'out-of-stock';
  sort_by?: 'name' | 'price' | 'stock_quantity' | 'created_at';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// ============================================================================
// Admin API Service Class
// ============================================================================

class AdminApiService {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('auth_token');
    console.log('Getting auth token:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
  }

  /**
   * Handle API errors with descriptive messages
   */
  private handleError(error: unknown): never {
    if (error instanceof Error) {
      throw error;
    }
    
    if (typeof error === 'object' && error !== null) {
      const apiError = error as ApiError;
      const message = apiError.message || 'An unexpected error occurred';
      const errorObj = new Error(message) as Error & { errors?: Record<string, string[]>; status?: number };
      
      if (apiError.errors) {
        errorObj.errors = apiError.errors;
      }
      if (apiError.status) {
        errorObj.status = apiError.status;
      }
      
      throw errorObj;
    }
    
    throw new Error('An unexpected error occurred');
  }

  /**
   * Retry logic for failed requests
   */
  private async retry<T>(
    fn: () => Promise<T>,
    attempts: number = this.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempts <= 1) {
        this.handleError(error);
      }

      // Only retry on network errors or 5xx server errors
      const shouldRetry = 
        error instanceof TypeError || // Network errors
        (error instanceof Error && 
         'status' in error && 
         typeof (error as any).status === 'number' && 
         (error as any).status >= 500);

      if (!shouldRetry) {
        this.handleError(error);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      
      return this.retry(fn, attempts - 1);
    }
  }

  /**
   * Core request method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge with any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: ApiError;
      
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      const error = new Error(errorData.message || 'Request failed') as Error & ApiError;
      error.status = response.status;
      error.errors = errorData.errors;
      
      throw error;
    }

    // Handle empty responses (like DELETE)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  }

  // ============================================================================
  // Product CRUD Operations
  // ============================================================================

  /**
   * Get all products with filters and pagination
   */
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    return this.retry(async () => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category_id) params.append('category_id', filters.category_id.toString());
      if (filters.subcategory_id) params.append('subcategory_id', filters.subcategory_id.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
      if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
      if (filters.stock_status) params.append('stock_status', filters.stock_status);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
      if (filters.per_page) params.append('per_page', filters.per_page.toString());
      if (filters.page) params.append('page', filters.page.toString());

      const queryString = params.toString();
      const endpoint = `/admin/products${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.request<PaginatedResponse<Product>>(endpoint);
      
      return response;
    });
  }

  /**
   * Get single product by ID
   */
  async getProduct(id: number): Promise<Product> {
    return this.retry(async () => {
      // Temporarily use public products endpoint for testing
      const response = await this.request<Product>(`/products/${id}`);
      return response;
    });
  }

  /**
   * Create a new product
   */
  async createProduct(data: ProductInput & { image?: File }): Promise<Product> {
    return this.retry(async () => {
      const formData = new FormData();
      
      // Add all product data to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'image' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add image file if provided and it's a valid File object
      if (data.image && data.image instanceof File) {
        formData.append('image', data.image);
      }

      const token = this.getAuthToken();
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Log the form data for debugging
      console.log('Sending product data:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorData: ApiError;
        
        try {
          errorData = await response.json();
          console.log('Validation errors:', errorData);
        } catch {
          errorData = {
            message: `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
          };
        }

        const error = new Error(errorData.message || 'Request failed') as Error & ApiError;
        error.status = response.status;
        error.errors = errorData.errors;
        
        throw error;
      }

      const result = await response.json();
      return result.data;
    });
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: number, data: Partial<ProductInput> & { image?: File }): Promise<Product> {
    return this.retry(async () => {
      const formData = new FormData();
      
      // Add all product data to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'image' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add image file if provided
      if (data.image) {
        formData.append('image', data.image);
      }

      // Use POST with _method override for file uploads
      formData.append('_method', 'PUT');

      const token = this.getAuthToken();
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorData: ApiError;
        
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            message: `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
          };
        }

        const error = new Error(errorData.message || 'Request failed') as Error & ApiError;
        error.status = response.status;
        error.errors = errorData.errors;
        
        throw error;
      }

      const result = await response.json();
      return result.data;
    });
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
    return this.retry(async () => {
      const response = await this.request<{ success: boolean; message: string; data?: any }>(`/admin/products/${id}`, {
        method: 'DELETE',
      });
      return {
        success: response.success,
        message: response.message
      };
    });
  }

  // ============================================================================
  // Settings Operations
  // ============================================================================

  /**
   * Get all settings
   */
  async getSettings(): Promise<{
    general: Record<string, any>;
    payment: Record<string, any>;
    shipping: Record<string, any>;
    notifications: Record<string, any>;
  }> {
    return this.retry(async () => {
      return this.request('/admin/settings');
    });
  }

  /**
   * Get settings by group
   */
  async getSettingsByGroup(group: string): Promise<Record<string, any>> {
    return this.retry(async () => {
      return this.request(`/admin/settings/${group}`);
    });
  }

  /**
   * Update settings for a group
   */
  async updateSettings(group: string, settings: Record<string, any>): Promise<{
    message: string;
    settings: Record<string, any>;
  }> {
    return this.retry(async () => {
      return this.request(`/admin/settings/${group}`, {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    });
  }

  /**
   * Update admin password
   */
  async updatePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<{ message: string }> {
    return this.retry(async () => {
      return this.request('/admin/settings/password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    });
  }
}

export const adminApi = new AdminApiService();
