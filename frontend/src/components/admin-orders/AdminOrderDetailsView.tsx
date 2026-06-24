"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { SneakerImage } from "@/components/products/SneakerImage";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatDateTime, formatPrice } from "@/lib/format";
import { adminOrderService } from "@/services/adminOrderService";
import type { AdminOrderDetail, AdminOrderStatus } from "@/types/adminOrder";
import { ADMIN_ORDER_STATUSES } from "@/types/adminOrder";

export function AdminOrderDetailsView() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState<AdminOrderStatus | "">("");

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminOrderService.getOrder(orderId);
        if (!cancelled) {
          setOrder(data);
          setNextStatus(data.orderStatus);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Failed to load order details"));
          setOrder(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const allowedStatuses = useMemo(() => {
    if (!order) return ADMIN_ORDER_STATUSES;
    switch (order.orderStatus) {
      case "PENDING":
        return ["PENDING", "PROCESSING", "CANCELLED"] as AdminOrderStatus[];
      case "PROCESSING":
        return ["PROCESSING", "SHIPPED", "CANCELLED"] as AdminOrderStatus[];
      case "SHIPPED":
        return ["SHIPPED", "DELIVERED"] as AdminOrderStatus[];
      case "DELIVERED":
      case "CANCELLED":
        return [order.orderStatus] as AdminOrderStatus[];
      default:
        return ADMIN_ORDER_STATUSES;
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!order || !nextStatus || nextStatus === order.orderStatus) return;

    setStatusUpdating(true);
    setStatusError(null);
    setStatusSuccess(null);
    try {
      const updated = await adminOrderService.updateOrderStatus(order.orderId, nextStatus);
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: updated.orderStatus as AdminOrderStatus,
              payment: {
                ...prev.payment,
                paymentStatus: updated.paymentStatus as typeof prev.payment.paymentStatus,
              },
            }
          : prev,
      );
      setStatusSuccess("Order status updated successfully.");
    } catch (err) {
      setStatusError(getApiErrorMessage(err, "Failed to update order status"));
    } finally {
      setStatusUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <section className="space-y-4">
        <Alert variant="error" message={error ?? "Order not found"} />
        <Link
          href="/admin/orders"
          className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-zinc-600 dark:text-zinc-200"
        >
          Back to orders
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Admin order details
          </p>
          <h1 className="mt-1 break-all font-mono text-sm text-gray-700 dark:text-zinc-300">
            {order.orderId}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{formatDateTime(order.createdAt)}</p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-zinc-600 dark:text-zinc-200"
        >
          Back to orders
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
            Customer details
          </h2>
          <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-zinc-100">{order.customer.name}</p>
          <p className="text-sm text-gray-600 dark:text-zinc-400">{order.customer.email}</p>
          <p className="mt-3 text-sm text-gray-600 dark:text-zinc-400">
            {order.shippingAddress}, {order.city}, {order.postalCode}, {order.country}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
            Payment info
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500 dark:text-zinc-400">Payment</span>
              <OrderStatusBadge kind="payment" status={order.payment.paymentStatus} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500 dark:text-zinc-400">Order</span>
              <OrderStatusBadge kind="order" status={order.orderStatus} />
            </div>
            <p className="pt-2 text-xs text-gray-500 dark:text-zinc-400">
              Razorpay Order: {order.payment.razorpayOrderId ?? "—"}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Razorpay Payment: {order.payment.razorpayPaymentId ?? "—"}
            </p>
            {order.appliedCoupons && order.appliedCoupons.length > 0 ? (
              <div className="pt-2 space-y-1">
                {order.appliedCoupons.map((coupon) => (
                  <p key={coupon.couponCode} className="text-xs text-gray-500 dark:text-zinc-400">
                    {coupon.couponCode}: −{formatPrice(coupon.discountAmount)}
                  </p>
                ))}
              </div>
            ) : null}
            <p className="pt-2 text-lg font-bold text-gray-900 dark:text-zinc-100">
              {formatPrice(order.finalAmount ?? order.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
          Update order status
        </h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value as AdminOrderStatus)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 sm:w-64 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {allowedStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void handleStatusUpdate()}
            disabled={statusUpdating || !nextStatus || nextStatus === order.orderStatus}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500"
          >
            {statusUpdating ? "Updating..." : "Update status"}
          </button>
        </div>
        {statusError ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{statusError}</p> : null}
        {statusSuccess ? (
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{statusSuccess}</p>
        ) : null}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
            Order items
          </h2>
        </div>
        <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
          {order.items.map((item) => (
            <li key={item.itemId} className="flex gap-3 px-4 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
                <SneakerImage src={item.imageUrl} alt={item.sneakerName} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-zinc-100">{item.sneakerName}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  Qty {item.quantity} · {formatPrice(item.unitPrice)} each
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-gray-900 dark:text-zinc-100">
                {formatPrice(item.lineSubtotal)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
