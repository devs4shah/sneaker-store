import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { Wishlist } from "@/types/wishlist";

export const wishlistService = {
  async getWishlist(): Promise<Wishlist> {
    const { data } = await apiClient.get<ApiResponse<Wishlist>>("/api/wishlist");
    return data.data;
  },

  async addToWishlist(sneakerId: string): Promise<Wishlist> {
    const { data } = await apiClient.post<ApiResponse<Wishlist>>(`/api/wishlist/${sneakerId}`);
    return data.data;
  },

  async removeFromWishlist(sneakerId: string): Promise<Wishlist> {
    const { data } = await apiClient.delete<ApiResponse<Wishlist>>(`/api/wishlist/${sneakerId}`);
    return data.data;
  },
};
