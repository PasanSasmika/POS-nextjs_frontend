import { create } from 'zustand';
import { Product } from '@/app/dashboard/inventory/components/ProductType'; // Reuse our Product type

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  // Add a product to the cart or increment its quantity
  addItem: (product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        // Increment quantity
        return {
          items: state.items.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      } else {
        // Add new item
        return { items: [...state.items, { ...product, quantity: 1 }] };
      }
    });
  },

  // Remove an item from the cart
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    }));
  },

  // Update the quantity of a specific item
  updateQuantity: (productId, newQuantity) => {
    if (newQuantity <= 0) {
      // If quantity is 0 or less, remove the item
      get().removeItem(productId);
    } else {
      set((state) => ({
        items: state.items.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        ),
      }));
    }
  },

  // Clear the entire cart
  clearCart: () => {
    set({ items: [] });
  },

  // Calculate the total price of the cart
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.sellingPrice * item.quantity, 0);
  },
}));