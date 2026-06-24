import type { PageResponse } from "@/types/product";

export type { PageResponse };

export interface OrderListItem {
  id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  totalQuantity: number;
  createdAt: string;
}

export interface CreateOrderRequest {
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  couponCodes?: string[];
}

export interface OrderCoupon {
  couponCode: string;
  discountAmount: number;
}

export interface OrderItem {
  id: string;
  sneakerName: string;
  sneakerPrice: number;
  quantity: number;
  imageUrl: string | null;
  lineSubtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  appliedCoupons: OrderCoupon[];
  discountAmount: number;
  finalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  totalQuantity: number;
  items: OrderItem[];
  createdAt: string;
}
