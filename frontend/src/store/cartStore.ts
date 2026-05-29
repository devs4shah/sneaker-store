"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getApiErrorMessage } from "@/lib/apiClient";
import { CART_STORAGE_KEY } from "@/lib/constants";
import { cartService } from "@/services/cartService";
import { useAuthStore } from "@/store/authStore";
import type { Cart } from "@/types/cart";

interface CartState {
  cart: Cart | null;
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  hasHydrated: boolean;

  applyCart: (cart: Cart) => void;
  reset: () => void;
  fetchCart: () => Promise<void>;
  refreshCartCount: () => Promise<void>;
  addItem: (sneakerId: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

function applyCartToState(cart: Cart) {
  return {
    cart,
    totalItems: cart.totalItems,
    subtotal: cart.subtotal,
    error: null,
  };
}

const emptyState = {
  cart: null as Cart | null,
  totalItems: 0,
  subtotal: 0,
  error: null as string | null,
};

function blockCartForAdmin(get: () => CartState): boolean {
  if (useAuthStore.getState().isAdmin()) {
    get().reset();
    return true;
  }
  return false;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...emptyState,
      isLoading: false,
      isMutating: false,
      hasHydrated: false,

      applyCart: (cart) => set(applyCartToState(cart)),

      reset: () => set({ ...emptyState, isLoading: false, isMutating: false }),

      fetchCart: async () => {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
          get().reset();
          return;
        }
        if (blockCartForAdmin(get)) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const cart = await cartService.getCart();
          set({ ...applyCartToState(cart), isLoading: false });
        } catch (err) {
          set({
            ...emptyState,
            isLoading: false,
            error: getApiErrorMessage(err, "Failed to load cart"),
          });
        }
      },

      refreshCartCount: async () => {
        await get().fetchCart();
      },

      addItem: async (sneakerId, quantity = 1) => {
        if (blockCartForAdmin(get)) {
          return;
        }
        set({ isMutating: true, error: null });
        try {
          const cart = await cartService.addItem(sneakerId, quantity);
          set({ ...applyCartToState(cart), isMutating: false });
        } catch (err) {
          set({
            isMutating: false,
            error: getApiErrorMessage(err, "Could not add to cart"),
          });
          throw err;
        }
      },

      updateItemQuantity: async (itemId, quantity) => {
        if (blockCartForAdmin(get)) {
          return;
        }
        set({ isMutating: true, error: null });
        try {
          const cart = await cartService.updateItem(itemId, quantity);
          set({ ...applyCartToState(cart), isMutating: false });
        } catch (err) {
          set({
            isMutating: false,
            error: getApiErrorMessage(err, "Could not update quantity"),
          });
          throw err;
        }
      },

      removeItem: async (itemId) => {
        if (blockCartForAdmin(get)) {
          return;
        }
        set({ isMutating: true, error: null });
        try {
          const cart = await cartService.removeItem(itemId);
          set({ ...applyCartToState(cart), isMutating: false });
        } catch (err) {
          set({
            isMutating: false,
            error: getApiErrorMessage(err, "Could not remove item"),
          });
          throw err;
        }
      },

      clearCart: async () => {
        if (blockCartForAdmin(get)) {
          return;
        }
        set({ isMutating: true, error: null });
        try {
          const cart = await cartService.clearCart();
          set({ ...applyCartToState(cart), isMutating: false });
        } catch (err) {
          set({
            isMutating: false,
            error: getApiErrorMessage(err, "Could not clear cart"),
          });
          throw err;
        }
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    },
  ),
);
