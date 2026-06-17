import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  CreateReviewPayload,
  Review,
  SneakerReviewsData,
  UpdateReviewPayload,
} from "@/types/review";

export const reviewService = {
  async getSneakerReviews(
    sneakerId: string,
    page = 0,
    size = 5,
  ): Promise<SneakerReviewsData> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: "createdAt,desc",
    });

    const { data } = await apiClient.get<ApiResponse<SneakerReviewsData>>(
      `/api/reviews/sneaker/${sneakerId}?${params.toString()}`,
    );
    return data.data;
  },

  async createReview(payload: CreateReviewPayload): Promise<Review> {
    const { data } = await apiClient.post<ApiResponse<Review>>("/api/reviews", payload);
    return data.data;
  },

  async updateReview(reviewId: string, payload: UpdateReviewPayload): Promise<Review> {
    const { data } = await apiClient.put<ApiResponse<Review>>(
      `/api/reviews/${reviewId}`,
      payload,
    );
    return data.data;
  },

  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/api/reviews/${reviewId}`);
  },
};
