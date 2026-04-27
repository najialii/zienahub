
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  created_at?: string;
  updated_at?: string;
}


export interface Tag {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  description_en?: string;
  description_ar?: string;
  type: string;
  color: string;
  icon?: string;
  starts_at?: string | null, 
  ends_at?: string | null,
  discount_percentage:number,
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TagFormData {
  name_en: string;
  name_ar: string;
  slug?: string;
  description_en?: string;
  description_ar?: string;
  type: string;
  color: string;
  icon?: string;
  starts_at?: string | null, 
  ends_at?: string | null, 
  discount_percentage:number,
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
}


export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  how_to_use?: string;
  ingredients?: string;
  benefits?: string;
  brand?: string;
  size?: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  image_url: string;
  images?: { id: number; image_url: string; sort_order: number }[];
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: number;
    name: string;
    slug: string;
  };
  subcategory_id?: number;
  tag_id?: number | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'tenant_admin' | 'super_admin' | 'admin';
  tenant_id?: number | null;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}
