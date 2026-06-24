import type { PageResponse } from "@/types/product";

export type { PageResponse };

export type AdminOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type AdminPaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface AdminOrderListItem {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentStatus: AdminPaymentStatus;
  orderStatus: AdminOrderStatus;
  createdAt: string;
}

export interface AdminOrderCustomerInfo {
  userId: string;
  name: string;
  email: string;
}

export interface AdminOrderItemInfo {
  itemId: string;
  sneakerId: string;
  sneakerName: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  imageUrl: string | null;
}

export interface AdminOrderPaymentInfo {
  paymentStatus: AdminPaymentStatus;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
}

export interface AdminOrderCoupon {
  couponCode: string;
  discountAmount: number;
}

export interface AdminOrderDetail {
  orderId: string;
  orderNumber: string;
  customer: AdminOrderCustomerInfo;
  items: AdminOrderItemInfo[];
  totalAmount: number;
  appliedCoupons?: AdminOrderCoupon[];
  discountAmount?: number;
  finalAmount?: number;
  totalQuantity: number;
  payment: AdminOrderPaymentInfo;
  orderStatus: AdminOrderStatus;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  createdAt: string;
}

export const ADMIN_ORDER_STATUSES: AdminOrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const ADMIN_PAYMENT_STATUSES: AdminPaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];
