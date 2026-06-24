import type { Sneaker } from "@/types/product";

export interface WishlistItem {
  id: string;
  sneakerId: string;
  sneaker: Sneaker;
  addedAt: string;
}

export interface Wishlist {
  totalItems: number;
  items: WishlistItem[];
}
