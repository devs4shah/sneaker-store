import type { PageResponse } from "@/types/product";

export type CouponType = "PERCENTAGE" | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  couponType: CouponType;
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CouponPageResponse = PageResponse<Coupon>;

export interface ValidateCouponsRequest {
  couponCodes: string[];
  cartTotal: number;
}

export interface AppliedCouponLine {
  couponCode: string;
  discountAmount: number;
}

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  appliedCoupons: AppliedCouponLine[];
  discount: number;
  finalAmount: number;
}

export interface AppliedCouponsState {
  coupons: AppliedCouponLine[];
  totalDiscount: number;
  finalAmount: number;
}

export interface CreateCouponPayload {
  code: string;
  couponType: CouponType;
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  validFrom: string;
  validUntil: string;
  active?: boolean;
}

export interface UpdateCouponPayload {
  code?: string;
  couponType?: CouponType;
  discountValue?: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  validFrom?: string;
  validUntil?: string;
  active?: boolean;
}

export interface AvailableCoupon {
  code: string;
  couponType: CouponType;
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount: number | null;
  applicable: boolean;
  unavailableReason: string | null;
}

export interface OrderCoupon {
  couponCode: string;
  discountAmount: number;
}
