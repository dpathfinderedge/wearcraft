import { create } from 'zustand';
import { Product } from '@/types/product';
import { WishlistItem } from '@/types/wishlist';
import { apiClient } from '@/lib/api-client';

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  loadWishlist: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<{ success: boolean; error?: string }>;
  isWishlisted: (product: Product) => boolean;
  clearError: () => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  isLoading: false,
  hasLoaded: false,
  error: null,

  loadWishlist: async () => {
    set({ isLoading: true, error: null });
    const response = await apiClient.getWishlist();
    if (response.success && response.data) {
      set({ items: response.data as WishlistItem[], isLoading: false, hasLoaded: true });
      return;
    }
    set({ isLoading: false, hasLoaded: true, error: response.error || 'Unable to load your wishlist.' });
  },

  toggleWishlist: async (product) => {
    const existing = get().items.find(
      (item) => item.productId === product.id || item.product.name === product.name
    );

    if (existing) {
      const response = await apiClient.removeFromWishlist(existing.productId);
      if (!response.success) {
        const error = response.error || 'Unable to remove item from wishlist.';
        set({ error });
        return { success: false, error };
      }
      set((state) => ({
        items: state.items.filter((item) => item.id !== existing.id),
        error: null,
      }));
      return { success: true };
    }

    const response = await apiClient.addToWishlist(product.id, product.name);
    if (!response.success || !response.data) {
      const error = response.error || 'Unable to add item to wishlist.';
      set({ error });
      return { success: false, error };
    }

    set((state) => ({ items: [...state.items, response.data as WishlistItem], error: null }));
    return { success: true };
  },

  isWishlisted: (product) =>
    get().items.some((item) => item.productId === product.id || item.product.name === product.name),

  clearError: () => set({ error: null }),
}));
