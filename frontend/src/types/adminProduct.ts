import type { Category, Gender, Sneaker, SneakerImage } from "@/types/product";

export type { Category, Gender, Sneaker, SneakerImage };

export interface CreateSneakerPayload {
  name: string;
  brand: string;
  description?: string;
  price: number;
  stockQuantity: number;
  gender: Gender;
  color: string;
  size: number;
  categoryId: string;
}

export interface UpdateSneakerPayload {
  name?: string;
  brand?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  gender?: Gender;
  color?: string;
  size?: number;
  categoryId?: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface ImageUploadResult {
  sneakerId: string;
  uploadedCount: number;
  images: SneakerImage[];
}

export const MAX_IMAGES_PER_UPLOAD = 10;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
