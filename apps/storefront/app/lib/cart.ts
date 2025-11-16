import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  image?: string;
  slug?: string;
  sku?: string;
  maxQuantity?: number; // For inventory tracking
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getItem: (id: string) => CartItem | undefined;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const quantity = item.quantity ?? 1;
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);

          if (existing) {
            // Update quantity of existing item
            const newQuantity = existing.quantity + quantity;
            const maxQty = item.maxQuantity ?? Infinity;

            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(newQuantity, maxQty) }
                  : i
              ),
            };
          }

          // Add new item
          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity,
              },
            ],
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((i) => {
            if (i.id === id) {
              const maxQty = i.maxQuantity ?? Infinity;
              return { ...i, quantity: Math.min(quantity, maxQty) };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getItem: (id) => {
        return get().items.find((i) => i.id === id);
      },
    }),
    {
      name: 'akva-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper function to format VND currency
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

// Helper function to calculate discount percentage
export function getDiscountPercentage(
  price: number,
  compareAtPrice?: number
): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
