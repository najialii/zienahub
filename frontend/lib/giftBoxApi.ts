import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('gift_box_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('gift_box_session_id', sessionId);
  }
  return sessionId;
};

// Add session ID to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    config.headers['X-Session-ID'] = getSessionId();
  }
  return config;
});

export interface GiftBoxProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface GiftBoxItem {
  id: number;
  quantity: number;
  price: number;
  product: GiftBoxProduct;
}

export interface GiftBox {
  id: number;
  name?: string;
  message?: string;
  total_price: number;
  status: string;
  items: GiftBoxItem[];
  created_at: string;
  updated_at: string;
}

export const giftBoxApi = {
  /**
   * Get current draft gift box
   */
  getCurrent: async (): Promise<GiftBox> => {
    const response = await api.get('/gift-box');
    return response.data.data;
  },

  /**
   * Add item to gift box
   */
  addItem: async (productId: number, quantity: number = 1): Promise<GiftBox> => {
    const response = await api.post('/gift-box/items', {
      product_id: productId,
      quantity,
    });
    return response.data.data;
  },

  /**
   * Update item quantity
   */
  updateItem: async (itemId: number, quantity: number): Promise<GiftBox> => {
    const response = await api.put(`/gift-box/items/${itemId}`, {
      quantity,
    });
    return response.data.data;
  },

  /**
   * Remove item from gift box
   */
  removeItem: async (itemId: number): Promise<GiftBox> => {
    const response = await api.delete(`/gift-box/items/${itemId}`);
    return response.data.data;
  },

  /**
   * Update gift box message and name
   */
  updateMessage: async (message: string, name?: string): Promise<GiftBox> => {
    const response = await api.put('/gift-box/message', {
      message,
      name,
    });
    return response.data.data;
  },

  /**
   * Clear gift box
   */
  clear: async (): Promise<void> => {
    await api.delete('/gift-box');
  },
};

export default giftBoxApi;
