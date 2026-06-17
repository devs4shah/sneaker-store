import type { PageResponse } from "@/types/product";

export interface Review {
  id: string;
  sneakerId: string;
  userId: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SneakerReviewsData {
  averageRating: number;
  reviewCount: number;
  userReview: Review | null;
  reviews: PageResponse<Review>;
}

export interface CreateReviewPayload {
  sneakerId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating: number;
  comment?: string;
}
