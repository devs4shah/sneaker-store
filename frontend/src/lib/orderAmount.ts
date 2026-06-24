import type { Order } from "@/types/order";

export function getOrderPayableTotal(order: Pick<Order, "finalAmount" | "totalAmount">): number {
  return order.finalAmount ?? order.totalAmount;
}

export function getOrderDiscount(order: Pick<Order, "discountAmount">): number {
  return order.discountAmount ?? 0;
}

export function hasOrderDiscount(order: Pick<Order, "discountAmount" | "appliedCoupons">): boolean {
  return getOrderDiscount(order) > 0 || (order.appliedCoupons?.length ?? 0) > 0;
}
