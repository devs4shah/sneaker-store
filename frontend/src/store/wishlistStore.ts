"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getApiErrorMessage } from "@/lib/apiClient";
import { WISHLIST_STORAGE_KEY } from "@/lib/constants";
import { wishlistService } from "@/services/wishlistService";
import { useAuthStore } from "@/store/authStore";
import type { Wishlist, WishlistItem } from "@/types/wishlist";

interface WishlistState {
  items: WishlistItem[];
  sneakerIds: string[];
  totalItems: number;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  hasHydrated: boolean;

  applyWishlist: (wishlist: Wishlist) => void;
  reset: () => void;
  fetchWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  addToWishlist: (sneakerId: string) => Promise<void>;
  removeFromWishlist: (sneakerId: string) => Promise<void>;
  toggleWishlist: (sneakerId: string) => Promise<void>;
  isInWishlist: (sneakerId: string) => boolean;
}

function applyWishlistToState(wishlist: Wishlist) {
  return {
    items: wishlist.items,
    sneakerIds: wishlist.items.map((item) => item.sneakerId),
    totalItems: wishlist.totalItems,
    error: null,
  };
}

const emptyState = {
  items: [] as WishlistItem[],
  sneakerIds: [] as string[],
  totalItems: 0,
  error: null as string | null,
};

function blockWishlistForAdmin(get: () => WishlistState): boolean {
  if (useAuthStore.getState().isAdmin()) {
    get().reset();
    return true;
  }
  return false;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ...emptyState,
      isLoading: false,
      isMutating: false,
      hasHydrated: false,

      applyWishlist: (wishlist) => set(applyWishlistToState(wishlist)),

      reset: () => set({ ...emptyState, isLoading: false, isMutating: false }),

      fetchWishlist: async () => {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
          get().reset();
          return;
        }
        if (blockWishlistForAdmin(get)) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const wishlist = await wishlistService.getWishlist();
          set({ ...applyWishlistToState(wishlist), isLoading: false });
        } catch (err) {
          set({
            ...emptyState,
            isLoading: false,
            error: getApiErrorMessage(err, "Failed to load wishlist"),
          });
        }
      },

      refreshWishlist: async () => {
        await get().fetchWishlist();
      },

      addToWishlist: async (sneakerId) => {
        if (blockWishlistForAdmin(get)) {
          return;
        }
        set({ isMutating: true, error: null });
        try {
          const wishlist = await wishlistService.addToWishlist(sneakerId);
          set({ ...applyWishlistToState(wishlist), isMutating: false });
        } catch (err) {
          set({
            isMutating: false,
            error: getApiErrorMessage(err, "Could not add to wishlist"),
          });
          throw err;
        }
      },

      removeFromWishlist: async (sneakerId) => {
        if (blockWishlistForAdmin(get)) {
          return;
        }
        set({ isMutating: true, error: null });
        try {
          const wishlist = await wishlistService.removeFromWishlist(sneakerId);
          set({ ...applyWishlistToState(wishlist), isMutating: false });
        } catch (err) {
          set({
            isMutating: false,
            error: getApiErrorMessage(err, "Could not remove from wishlist"),
          });
          throw err;
        }
      },

      toggleWishlist: async (sneakerId) => {
        if (get().isInWishlist(sneakerId)) {
          await get().removeFromWishlist(sneakerId);
        } else {
          await get().addToWishlist(sneakerId);
        }
      },

      isInWishlist: (sneakerId) => get().sneakerIds.includes(sneakerId),
    }),
    {
      name: WISHLIST_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        sneakerIds: state.sneakerIds,
        totalItems: state.totalItems,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    },
  ),
);
