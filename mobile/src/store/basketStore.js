import { create } from "zustand";

export const useBasketStore = create((set, get) => ({
  basket: [], // { barcode, name, price, quantity }

  addItem: (product) => {
    set((state) => {
      const existingIndex = state.basket.findIndex(
        (item) => item.barcode === product.barcode
      );
      if (existingIndex !== -1) {
        const updated = [...state.basket];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return { basket: updated };
      }
      return {
        basket: [
          ...state.basket,
          { ...product, quantity: 1 },
        ],
      };
    });
  },

  increment: (barcode) => {
    set((state) => ({
      basket: state.basket.map((item) =>
        item.barcode === barcode
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    }));
  },

  decrement: (barcode) => {
    set((state) => ({
      basket: state.basket
        .map((item) =>
          item.barcode === barcode
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  },

  clear: () => set({ basket: [] }),

  total: () => {
    const items = get().basket;
    return items.reduce((sum, item) => {
      const price = Number(item.price ?? 0);
      if (Number.isNaN(price)) {
        return sum;
      }
      return sum + price * item.quantity;
    }, 0);
  },
}));
