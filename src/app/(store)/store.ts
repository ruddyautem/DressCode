import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "../../../sanity.types";

export interface BasketItem {
  product: Product;
  quantity: number;
}

interface BasketState {
  items: BasketItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearBasket: () => void;
  getTotalPrice: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => BasketItem[];
}

const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) =>
        set((state) => {
          const existingIndex = state.items.findIndex(item => item.product._id === product._id);
          
          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += 1;
            return { items: newItems };
          }
          
          return { items: [...state.items, { product, quantity: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items
            .map(item => 
              item.product._id === productId 
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter(item => item.quantity > 0)
        })),

      clearBasket: () => set({ items: [] }),

      getTotalPrice: () =>
        get().items.reduce((total, item) => 
          total + (item.product.price ?? 0) * item.quantity, 0
        ),

      getItemCount: (productId) =>
        get().items.find(item => item.product._id === productId)?.quantity ?? 0,

      getGroupedItems: () => get().items,
    }),
    { name: "basket-store" }
  )
);

export default useBasketStore;