import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "../../../sanity.types";

export interface BasketItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface BasketState {
  items: BasketItem[];
  addItem: (product: Product, size?: string) => void;
  addMultipleItems: (product: Product, quantity: number, size?: string) => void;
  removeItem: (productId: string, size?: string) => void;
  removeMultipleItems: (itemsToRemove: Array<{ productId: string; size?: string }>) => void;
  clearBasket: () => void;
  getTotalPrice: () => number;
  getItemCount: (productId: string, size?: string) => number;
  getGroupedItems: () => BasketItem[];
}

const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, size) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product._id === product._id && item.size === size
          );
          
          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += 1;
            return { items: newItems };
          }
          
          return { items: [...state.items, { product, quantity: 1, size }] };
        }),

      addMultipleItems: (product, quantity, size) =>
        set((state) => {
          if (quantity <= 0) return state;
          const existingIndex = state.items.findIndex(
            (item) => item.product._id === product._id && item.size === size
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += quantity;
            return { items: newItems };
          }

          return { items: [...state.items, { product, quantity, size }] };
        }),

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items
            .map((item) => 
              item.product._id === productId && (size === undefined || item.size === size)
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0)
        })),

      removeMultipleItems: (itemsToRemove) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !itemsToRemove.some(
                (target) =>
                  target.productId === item.product._id &&
                  (target.size === undefined || target.size === item.size)
              )
          ),
        })),

      clearBasket: () => set({ items: [] }),

      getTotalPrice: () =>
        get().items.reduce((total, item) => 
          total + (item.product.price ?? 0) * item.quantity, 0
        ),

      getItemCount: (productId, size) => {
        if (size !== undefined) {
          return (
            get().items.find(
              (item) => item.product._id === productId && item.size === size
            )?.quantity ?? 0
          );
        }
        return get().items
          .filter((item) => item.product._id === productId)
          .reduce((acc, item) => acc + item.quantity, 0);
      },

      getGroupedItems: () => get().items,
    }),
    { name: "basket-store" }
  )
);

export default useBasketStore;