// Cart state management using React Context with database sync
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image_url: string;
  sku?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      loading: false,

      fetchCart: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token, using local cart only');
          return;
        }

        try {
          set({ loading: true });
          const response = await fetch(`${API_URL}/cart`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (!response.ok) {
            console.error('Failed to fetch cart:', response.status);
            return;
          }

          const data = await response.json();
          if (data.success && data.data.items) {
            const items = data.data.items.map((item: any) => ({
              id: item.id,
              productId: item.product_id,
              name: item.product_name,
              slug: item.product_slug,
              price: parseFloat(item.product_price),
              quantity: item.quantity,
              image_url: item.product_image_url,
              sku: item.product_sku,
            }));
            set({ items });
            console.log('Cart fetched from server:', items.length, 'items');
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        } finally {
          set({ loading: false });
        }
      },

      addItem: async (item) => {
        if (!item.productId) {
          console.error('Cannot add item without productId:', item);
          return;
        }

        const items = get().items;
        const existingItem = items.find((i) => i.productId === item.productId);
        const quantity = item.quantity || 1;

        // Always update local state first (optimistic update)
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: undefined,
                productId: item.productId,
                name: item.name,
                slug: item.slug,
                price: item.price,
                quantity: quantity,
                image_url: item.image_url,
                sku: item.sku,
              },
            ],
          });
        }

        // Try to sync with server (non-blocking)
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token, cart saved locally only');
          return;
        }

        // Sync with server in background
        try {
          const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              product_id: item.productId,
              quantity: existingItem ? existingItem.quantity + quantity : quantity,
            }),
          });

          // Try to parse response
          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            console.warn('Failed to parse server response, but cart is saved locally');
            return; // Cart is already saved locally, so we're good
          }

          if (response.ok && data.success) {
            console.log('Cart synced with server successfully');
            // Update the local item id if it's a new item
            if (!existingItem && data.data && data.data.id) {
              const currentItems = get().items;
              const newItemIndex = currentItems.findIndex(i => i.productId === item.productId);
              if (newItemIndex !== -1) {
                currentItems[newItemIndex].id = data.data.id;
                set({ items: [...currentItems] });
              }
            }
          } else {
            // Log error but don't revert - cart is already saved locally
            console.warn('Server sync failed, but cart is saved locally:', {
              status: response.status,
              message: data?.message || 'Unknown error',
              errors: data?.errors || null
            });
          }
        } catch (error) {
          // Network error - cart is already saved locally, so just log
          console.warn('Network error syncing cart (cart saved locally):', error instanceof Error ? error.message : 'Unknown error');
        }
      },

      removeItem: async (id) => {
        const items = get().items;
        const item = items.find(i => i.productId === id);
        if (!item) return;

        // Always update local state first (optimistic update)
        set({ items: items.filter((item) => item.productId !== id) });

        // Try to sync with server (non-blocking)
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token, item removed locally only');
          return;
        }

        const serverId = item.id;
        if (!serverId) {
          console.log('No server ID, item removed locally only');
          return;
        }

        try {
          const response = await fetch(`${API_URL}/cart/${serverId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            console.log('Item removed from server cart');
          } else {
            console.warn('Failed to remove item from server, but removed locally');
          }
        } catch (error) {
          console.warn('Network error removing item (removed locally):', error instanceof Error ? error.message : 'Unknown error');
        }
      },

      updateQuantity: async (id, quantity) => {
        const items = get().items;
        const item = items.find(i => i.productId === id);
        if (!item) return;

        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }

        // Always update local state first (optimistic update)
        set({
          items: items.map((item) =>
            item.productId === id ? { ...item, quantity } : item
          ),
        });

        // Try to sync with server (non-blocking)
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token, quantity updated locally only');
          return;
        }

        const serverId = item.id;
        if (!serverId) {
          console.log('No server ID, quantity updated locally only');
          return;
        }

        try {
          const response = await fetch(`${API_URL}/cart/${serverId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ quantity }),
          });

          if (response.ok) {
            console.log('Quantity updated on server');
          } else {
            console.warn('Failed to update quantity on server, but updated locally');
          }
        } catch (error) {
          console.warn('Network error updating quantity (updated locally):', error instanceof Error ? error.message : 'Unknown error');
        }
      },

      clearCart: async () => {
        // Always update local state first (optimistic update)
        set({ items: [] });

        // Try to sync with server (non-blocking)
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token, cart cleared locally only');
          return;
        }

        try {
          const response = await fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            console.log('Cart cleared on server');
          } else {
            console.warn('Failed to clear cart on server, but cleared locally');
          }
        } catch (error) {
          console.warn('Network error clearing cart (cleared locally):', error instanceof Error ? error.message : 'Unknown error');
        }
      },

      syncCart: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.log('No auth token, cannot sync cart');
          return;
        }

        const items = get().items;
        if (items.length === 0) {
          console.log('No items to sync');
          return;
        }

        try {
          const response = await fetch(`${API_URL}/cart/sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              items: items.map(item => ({
                product_id: item.productId,
                quantity: item.quantity,
              })),
            }),
          });

          const data = await response.json();
          if (response.ok && data.success) {
            console.log('Cart synced successfully');
            // Optionally update local cart with server response
            await get().fetchCart();
          } else {
            console.error('Failed to sync cart:', data);
          }
        } catch (error) {
          console.error('Network error syncing cart:', error);
        }
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'zeina-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Clean up any items without productId
        if (persistedState && persistedState.items) {
          persistedState.items = persistedState.items.filter((item: any) => {
            if (!item.productId) {
              console.warn('Removing invalid cart item without productId:', item);
              return false;
            }
            return true;
          });
        }
        return persistedState;
      },
    }
  )
);
