'use server';

import { cookies } from 'next/headers';
import { cartApi, wishlistApi, authApi } from '@/lib/server/api';
import { revalidatePath } from 'next/cache';

// ==================== Helper Functions ====================

/**
 * Get the auth token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || null;
}

/**
 * Get the current user from the session
 */
export async function getCurrentUser() {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const user = await authApi.me(token);
    return user;
  } catch {
    return null;
  }
}

// ==================== Cart Actions ====================

export interface CartActionResult {
  success: boolean;
  error?: string;
  cart?: {
    items: Array<{
      id: number;
      product: {
        id: number;
        name: string;
        price: number;
        image_url: string;
      };
      quantity: number;
    }>;
    total: number;
  };
}

/**
 * Add item to cart
 */
export async function addToCart(productId: number, quantity: number = 1): Promise<CartActionResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const cart = await cartApi.addItem(productId, quantity, token);
    revalidatePath('/');

    return {
      success: true,
      cart: {
        items: cart.items.map(item => ({
          id: item.id,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image_url: item.product.image_url,
          },
          quantity: item.quantity,
        })),
        total: cart.total,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add item to cart',
    };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(itemId: number, quantity: number): Promise<CartActionResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const cart = await cartApi.updateItem(itemId, quantity, token);
    revalidatePath('/');

    return {
      success: true,
      cart: {
        items: cart.items.map(item => ({
          id: item.id,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image_url: item.product.image_url,
          },
          quantity: item.quantity,
        })),
        total: cart.total,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update cart item',
    };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(itemId: number): Promise<CartActionResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const cart = await cartApi.removeItem(itemId, token);
    revalidatePath('/');

    return {
      success: true,
      cart: {
        items: cart.items.map(item => ({
          id: item.id,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image_url: item.product.image_url,
          },
          quantity: item.quantity,
        })),
        total: cart.total,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove item from cart',
    };
  }
}

/**
 * Get cart items
 */
export async function getCart(): Promise<CartActionResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const cart = await cartApi.get(token);

    return {
      success: true,
      cart: {
        items: cart.items.map(item => ({
          id: item.id,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image_url: item.product.image_url,
          },
          quantity: item.quantity,
        })),
        total: cart.total,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get cart',
    };
  }
}

// ==================== Wishlist Actions ====================

export interface WishlistActionResult {
  success: boolean;
  error?: string;
  wishlist?: Array<{
    id: number;
    product: {
      id: number;
      name: string;
      price: number;
      image_url: string;
      slug: string;
    };
  }>;
  added?: boolean;
}

/**
 * Toggle wishlist item
 */
export async function toggleWishlist(productId: number): Promise<WishlistActionResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const result = await wishlistApi.toggle(productId, token);
    revalidatePath('/');

    return {
      success: true,
      added: result.added,
      wishlist: result.wishlist.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image_url: item.product.image_url,
          slug: item.product.slug,
        },
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle wishlist',
    };
  }
}

/**
 * Get wishlist items
 */
export async function getWishlist(): Promise<WishlistActionResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required' };
    }

    const items = await wishlistApi.get(token);

    return {
      success: true,
      wishlist: items.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image_url: item.product.image_url,
          slug: item.product.slug,
        },
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get wishlist',
    };
  }
}

// ==================== Search Actions ====================

import { productsApi } from '@/lib/server/api';
import type { Product } from '@/lib/types';

export interface SearchResults {
  success: boolean;
  products?: Product[];
  error?: string;
}

/**
 * Search products (server action for search suggestions)
 */
export async function searchProducts(query: string, locale: string = 'en'): Promise<SearchResults> {
  try {
    if (query.trim().length < 2) {
      return { success: true, products: [] };
    }

    const products = await productsApi.search(query, locale);

    return {
      success: true,
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity || 0,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug || '',
        } : undefined,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}
