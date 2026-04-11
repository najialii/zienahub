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
        const token = localStorage.getItem('auth_token');
        
        // Check if already exists locally
        const items = get().items;
        const exists = items.find((i) => i.productId === item.productId);
        if (exists) {
          console.log('Item already in wishlist locally');
          return;
        }

        // Add to local state immediately
        const newItem = { ...item, addedAt: Date.now() };
        set({ items: [...items, newItem] });
        console.log('Added item to wishlist locally:', item.productId);

        if (!token) {
          console.log('No auth token, keeping local only');
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

          const data = await response.json();

          if (response.ok) {
            console.log('Item added to wishlist on server:', item.productId);
            return;
          }

          // If 400 and already exists, keep it in local state (don't revert)
          if (response.status === 400 && data.message?.includes('already in wishlist')) {
            console.log('Item already in wishlist on server, keeping local copy');
            return;
          }

          // Only revert on actual server errors (500, etc)
          if (response.status >= 500) {
            console.error('Server error adding to wishlist:', data);
            set({ items: get().items.filter((i) => i.productId !== item.productId) });
          }
        } catch (error) {
          console.error('Network error adding to wishlist:', error);
          // Revert on network error
          set({ items: get().items.filter((i) => i.productId !== item.productId) });
        }
      },

      removeItem: async (productId) => {
        const token = localStorage.getItem('auth_token');
        
        // Optimistic update - remove from UI immediately
        const previousItems = get().items;
        set({ items: previousItems.filter((item) => item.productId !== productId) });
        console.log('Removing item from wishlist:', productId);

        if (!token) {
          console.log('No auth token, keeping local removal only');
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

          const data = await response.json();

          if (response.ok) {
            console.log('Item removed from wishlist on server:', productId);
          } else {
            console.error('Failed to remove from wishlist on server:', data);
            // Revert on error
            set({ items: previousItems });
          }
        } catch (error) {
          console.error('Failed to remove from wishlist:', error);
          // Revert on error
          set({ items: previousItems });
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
        const token = localStorage.getItem('auth_token');
        
        // Optimistic update
        const previousItems = get().items;
        set({ items: [] });

        if (!token) return;

        try {
          const response = await fetch(`${API_URL}/wishlist`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (!response.ok) {
            // Revert on error
            set({ items: previousItems });
          }
        } catch (error) {
          console.error('Failed to clear wishlist:', error);
          // Revert on error
          set({ items: previousItems });
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
