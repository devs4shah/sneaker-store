import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  InventoryItem,
  InventoryPageResponse,
  UpdateInventoryPayload,
} from "@/types/adminInventory";

export const adminInventoryService = {
  async getInventory(page = 0, size = 20): Promise<InventoryPageResponse> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: "name,asc",
    });

    const { data } = await apiClient.get<ApiResponse<InventoryPageResponse>>(
      `/api/admin/inventory?${params.toString()}`,
    );
    return data.data;
  },

  async updateStock(sneakerId: string, payload: UpdateInventoryPayload): Promise<InventoryItem> {
    const { data } = await apiClient.patch<ApiResponse<InventoryItem>>(
      `/api/admin/inventory/${sneakerId}`,
      payload,
    );
    return data.data;
  },
};
