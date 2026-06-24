import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  AvailableCoupon,
  CouponValidationResult,
  ValidateCouponsRequest,
} from "@/types/coupon";

export const couponService = {
  async validateCoupons(request: ValidateCouponsRequest): Promise<CouponValidationResult> {
    const { data } = await apiClient.post<ApiResponse<CouponValidationResult>>(
      "/api/coupons/validate",
      request,
    );
    return data.data;
  },

  async getAvailableCoupons(
    cartTotal: number,
    appliedCouponCodes: string[] = [],
  ): Promise<AvailableCoupon[]> {
    const { data } = await apiClient.get<ApiResponse<AvailableCoupon[]>>("/api/coupons/available", {
      params: {
        cartTotal,
        appliedCouponCodes,
      },
    });
    return data.data;
  },
};
