import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  Coupon,
  CouponPageResponse,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types/coupon";

export const adminCouponService = {
  async getCoupons(page = 0, size = 20): Promise<CouponPageResponse> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort: "createdAt,desc",
    });

    const { data } = await apiClient.get<ApiResponse<CouponPageResponse>>(
      `/api/admin/coupons?${params.toString()}`,
    );
    return data.data;
  },

  async getCoupon(id: string): Promise<Coupon> {
    const { data } = await apiClient.get<ApiResponse<Coupon>>(`/api/admin/coupons/${id}`);
    return data.data;
  },

  async createCoupon(payload: CreateCouponPayload): Promise<Coupon> {
    const { data } = await apiClient.post<ApiResponse<Coupon>>("/api/admin/coupons", payload);
    return data.data;
  },

  async updateCoupon(id: string, payload: UpdateCouponPayload): Promise<Coupon> {
    const { data } = await apiClient.put<ApiResponse<Coupon>>(`/api/admin/coupons/${id}`, payload);
    return data.data;
  },

  async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/coupons/${id}`);
  },
};
