import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  Category,
  PageResponse,
  Sneaker,
  SneakerFilters,
} from "@/types/product";

function buildSneakerParams(filters: SneakerFilters) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.brand?.trim()) params.set("brand", filters.brand.trim());
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.size != null) params.set("size", String(filters.size));
  if (filters.sort) params.set("sort", filters.sort);

  return params;
}

export const productService = {
  async getSneakers(filters: SneakerFilters = {}): Promise<PageResponse<Sneaker>> {
    const params = buildSneakerParams({
      page: 0,
      size: 12,
      sort: "createdAt,desc",
      ...filters,
    });

    const { data } = await apiClient.get<ApiResponse<PageResponse<Sneaker>>>(
      `/api/sneakers?${params.toString()}`,
    );
    return data.data;
  },

  async getSneakerById(id: string): Promise<Sneaker> {
    const { data } = await apiClient.get<ApiResponse<Sneaker>>(`/api/sneakers/${id}`);
    return data.data;
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<ApiResponse<Category[]>>("/api/categories");
    return data.data;
  },
};
