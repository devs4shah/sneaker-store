import type { PageResponse } from "@/types/product";

export type StockStatus = "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";

export interface InventoryItem {
  sneakerId: string;
  name: string;
  brand: string;
  categoryName: string;
  price: number;
  stockQuantity: number;
  lowStock: boolean;
  outOfStock: boolean;
  stockStatus: StockStatus;
}

export interface UpdateInventoryPayload {
  stockQuantity: number;
}

export type InventoryPageResponse = PageResponse<InventoryItem>;
