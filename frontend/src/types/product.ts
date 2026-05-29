export type Gender = "MEN" | "WOMEN" | "UNISEX" | "KIDS";

export interface Category {
  id: string;
  name: string;
}

export interface SneakerImage {
  id: string;
  imageUrl: string;
}

export interface Sneaker {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stockQuantity: number;
  gender: Gender;
  color: string;
  size: number;
  category: Category;
  images: SneakerImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface SneakerFilters {
  search?: string;
  brand?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "Newest" },
  { value: "price,asc", label: "Price: Low to High" },
  { value: "price,desc", label: "Price: High to Low" },
  { value: "name,asc", label: "Name: A–Z" },
] as const;
