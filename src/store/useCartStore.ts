import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartSummary } from '@/types/cart';
import { Product } from '@/types/product';
import { calculateTax, calculateShipping } from '@/lib/utils';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, selectedSize: string, selectedColor: string, quantity?: number) => void;
  removeItem: (productId: string, selectedSize: string, selectedColor: string) => void;
  updateQuantity: (productId: string, selectedSize: string, selectedColor: string, quantity: number) => void;
  clearCart: () => void;
  getCartSummary: () => CartSummary;
  getItemCount: () => number;
  isInCart: (productId: string, selectedSize: string, selectedColor: string) => boolean;
  getItemQuantity: (productId: string, selectedSize: string, selectedColor: string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, selectedSize, selectedColor, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedSize === selectedSize &&
              item.selectedColor === selectedColor
          );

          if (existingItemIndex > -1) {
            const newItems = [...state.items];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + quantity,
            };
            return { items: newItems };
          } else {
            const newItem: CartItem = {
              product,
              quantity,
              selectedSize,
              selectedColor,
              addedAt: new Date().toISOString(),
            };
            return { items: [...state.items, newItem] };
          }
        });
      },

      removeItem: (productId, selectedSize, selectedColor) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
              )
          ),
        }));
      },

      updateQuantity: (productId, selectedSize, selectedColor, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedSize, selectedColor);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getCartSummary: () => {
        const items = get().items;
        const subtotal = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        const shipping = calculateShipping(subtotal);
        const tax = calculateTax(subtotal);
        const total = subtotal + shipping + tax;

        return {
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: parseFloat(subtotal.toFixed(2)),
          shipping: parseFloat(shipping.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
        };
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      isInCart: (productId, selectedSize, selectedColor) => {
        return get().items.some(
          (item) =>
            item.product.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        );
      },

      getItemQuantity: (productId, selectedSize, selectedColor) => {
        const item = get().items.find(
          (item) =>
            item.product.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
        );
        return item?.quantity || 0;
      },
    }),
    {
      name: 'wearcraft-cart-storage',
    }
  )
);