import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  productId: number;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  addedAt: number;
}

interface WishlistStore {
  items: WishlistItem[];
  isOpen: boolean;
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  clearWishlist: () => Promise<void>;
  getTotalItems: () => number;
  openWishlist: () => void;
  closeWishlist: () => void;
  setItems: (items: WishlistItem[]) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      loading: false,

      fetchWishlist: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token, skipping wishlist fetch');
          return;
        }

        try {
          set({ loading: true });
          const response = await fetch(`${API_URL}/wishlist`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (!response.ok) {
            console.error('Failed to fetch wishlist:', response.status);
            return;
          }

          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            const items = data.data.map((item: any) => ({
              productId: item.product_id,
              name: item.name,
              slug: item.slug,
              price: parseFloat(item.price),
              image_url: item.image_url,
              addedAt: item.added_at * 1000,
            }));
            set({ items });
            console.log('Wishlist fetched:', items.length, 'items');
          }
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
        } finally {
          set({ loading: false });
        }
      },

      addItem: async (item) => {
        // Check if already exists locally
        const items = get().items;
        const exists = items.find((i) => i.productId === item.productId);
        if (exists) {
          console.log('Item already in wishlist');
          return;
        }

        // Always add to local state first (optimistic update)
        const newItem = { ...item, addedAt: Date.now() };
        set({ items: [...items, newItem] });

        // Try to sync with server (non-blocking)
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token, wishlist saved locally only');
          return;
        }

        try {
          const response = await fetch(`${API_URL}/wishlist`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ product_id: item.productId }),
          });

          if (response.ok) {
            console.log('Item added to wishlist on server');
          } else {
            const data = await response.json();
            // If already exists on server, that's fine - keep local copy
            if (response.status === 400 && data.message?.includes('already in wishlist')) {
              console.log('Item already in wishlist on server');
            } else {
              console.warn('Failed to add to wishlist on server, but saved locally');
            }
          }
        } catch (error) {
          console.warn('Network error adding to wishlist (saved locally):', error instanceof Error ? error.message : 'Unknown error');
        }
      },

      removeItem: async (productId) => {
        // Always update local state first (optimistic update)
        set({ items: get().items.filter((item) => item.productId !== productId) });

        // Try to sync with server (non-blocking)
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token, item removed locally only');
          return;
        }

        try {
          const response = await fetch(`${API_URL}/wishlist/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            console.log('Item removed from wishlist on server');
          } else {
            console.warn('Failed to remove from wishlist on server, but removed locally');
          }
        } catch (error) {
          console.warn('Network error removing from wishlist (removed locally):', error instanceof Error ? error.message : 'Unknown error');
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      toggleItem: async (item) => {
        const isInList = get().isInWishlist(item.productId);
        if (isInList) {
          await get().removeItem(item.productId);
        } else {
          await get().addItem(item);
        }
      },

      clearWishlist: async () => {
        // Always update local state first (optimistic update)
        set({ items: [] });

        // Try to sync with server (non-blocking)
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token, wishlist cleared locally only');
          return;
        }

        try {
          const response = await fetch(`${API_URL}/wishlist`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            console.log('Wishlist cleared on server');
          } else {
            console.warn('Failed to clear wishlist on server, but cleared locally');
          }
        } catch (error) {
          console.warn('Network error clearing wishlist (cleared locally):', error instanceof Error ? error.message : 'Unknown error');
        }
      },

      getTotalItems: () => {
        return get().items.length;
      },

      openWishlist: () => {
        set({ isOpen: true });
      },

      closeWishlist: () => {
        set({ isOpen: false });
      },

      setItems: (items) => {
        set({ items });
      },
    }),
    {
      name: 'zeina-wishlist',
    }
  )
);
