import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  Category,
  CreateCategoryPayload,
  CreateSneakerPayload,
  ImageUploadResult,
  Sneaker,
  UpdateSneakerPayload,
} from "@/types/adminProduct";
import type { PageResponse } from "@/types/product";
import { MAX_IMAGES_PER_UPLOAD } from "@/types/adminProduct";

export const adminProductService = {
  async getSneakers(page = 0, size = 10): Promise<PageResponse<Sneaker>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: "createdAt,desc",
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

  async createSneaker(payload: CreateSneakerPayload): Promise<Sneaker> {
    const { data } = await apiClient.post<ApiResponse<Sneaker>>("/api/sneakers", payload);
    return data.data;
  },

  async updateSneaker(id: string, payload: UpdateSneakerPayload): Promise<Sneaker> {
    const { data } = await apiClient.put<ApiResponse<Sneaker>>(`/api/sneakers/${id}`, payload);
    return data.data;
  },

  async deleteSneaker(id: string): Promise<void> {
    await apiClient.delete(`/api/sneakers/${id}`);
  },

  async uploadImages(sneakerId: string, files: File[]): Promise<ImageUploadResult> {
    if (files.length === 0) {
      throw new Error("At least one image file is required");
    }

    const batches: File[][] = [];
    for (let i = 0; i < files.length; i += MAX_IMAGES_PER_UPLOAD) {
      batches.push(files.slice(i, i + MAX_IMAGES_PER_UPLOAD));
    }

    let lastResult: ImageUploadResult | null = null;

    for (const batch of batches) {
      const formData = new FormData();
      for (const file of batch) {
        formData.append("files", file);
      }

      const { data } = await apiClient.post<ApiResponse<ImageUploadResult>>(
        `/api/sneakers/${sneakerId}/images`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      lastResult = data.data;
    }

    if (!lastResult) {
      throw new Error("Image upload failed");
    }

    return lastResult;
  },

  async deleteImage(sneakerId: string, imageId: string): Promise<Sneaker> {
    const { data } = await apiClient.delete<ApiResponse<Sneaker>>(
      `/api/sneakers/${sneakerId}/images/${imageId}`,
    );
    return data.data;
  },

  async reorderImages(sneakerId: string, imageIds: string[]): Promise<Sneaker> {
    const { data } = await apiClient.put<ApiResponse<Sneaker>>(
      `/api/sneakers/${sneakerId}/images/order`,
      { imageIds },
    );
    return data.data;
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<ApiResponse<Category[]>>("/api/categories");
    return data.data;
  },

  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await apiClient.post<ApiResponse<Category>>("/api/categories", payload);
    return data.data;
  },
};
