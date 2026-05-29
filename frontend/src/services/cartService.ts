import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { Cart } from "@/types/cart";

export const cartService = {
  async getCart(): Promise<Cart> {
    const { data } = await apiClient.get<ApiResponse<Cart>>("/api/cart");
    return data.data;
  },

  async addItem(sneakerId: string, quantity = 1): Promise<Cart> {
    const { data } = await apiClient.post<ApiResponse<Cart>>("/api/cart/items", {
      sneakerId,
      quantity,
    });
    return data.data;
  },

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const { data } = await apiClient.put<ApiResponse<Cart>>(`/api/cart/items/${itemId}`, {
      quantity,
    });
    return data.data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const { data } = await apiClient.delete<ApiResponse<Cart>>(`/api/cart/items/${itemId}`);
    return data.data;
  },

  async clearCart(): Promise<Cart> {
    const { data } = await apiClient.delete<ApiResponse<Cart>>("/api/cart");
    return data.data;
  },
};
