"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatPrice } from "@/lib/format";
import { getOrderDiscount, getOrderPayableTotal, hasOrderDiscount } from "@/lib/orderAmount";
import { orderService } from "@/services/orderService";
import type { Order } from "@/types/order";

export function PaymentSuccessView() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setError("Missing order reference.");
      setIsLoading(false);
      return;
    }

    void (async () => {
      try {
        const fetched = await orderService.getOrder(orderId);
        setOrder(fetched);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load order details."));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [orderId]);

  if (isLoading) {
    return <LoadingState message="Confirming your payment..." />;
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Order unavailable</h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400">{error ?? "Order not found."}</p>
        <Link
          href="/sneakers"
          className="inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentStatus === "PAID";
  const amountPaid = getOrderPayableTotal(order);
  const discount = getOrderDiscount(order);
  const showDiscount = hasOrderDiscount(order);

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div
        className={`rounded-2xl border px-6 py-10 ${
          isPaid
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
            : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
        }`}
      >
        <p
          className={`text-sm font-semibold uppercase tracking-wide ${
            isPaid
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-amber-700 dark:text-amber-400"
          }`}
        >
          {isPaid ? "Payment successful" : "Payment pending confirmation"}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-zinc-100">
          Thank you for your order
        </h1>
        <p className="mt-3 text-gray-600 dark:text-zinc-400">
          Order{" "}
          <span className="font-semibold text-gray-900 dark:text-zinc-100">{order.orderNumber}</span>
        </p>

        <div className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
          {showDiscount ? (
            <>
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              {order.appliedCoupons?.map((coupon) => (
                <div
                  key={coupon.couponCode}
                  className="flex justify-between text-emerald-700 dark:text-emerald-400"
                >
                  <span>{coupon.couponCode}</span>
                  <span>-{formatPrice(coupon.discountAmount)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-emerald-200/80 pt-2 font-medium text-emerald-800 dark:border-emerald-900/50 dark:text-emerald-300">
                <span>You saved</span>
                <span>{formatPrice(discount)}</span>
              </div>
            </>
          ) : null}
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900 dark:border-zinc-700 dark:text-zinc-100">
            <span>Amount paid</span>
            <span>{formatPrice(amountPaid)}</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">
          Shipping to {order.shippingAddress}, {order.city}, {order.postalCode}, {order.country}
        </p>
        {!isPaid && (
          <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
            We are still confirming your payment. Refresh this page in a moment if needed.
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/sneakers"
          className="inline-flex rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          Continue shopping
        </Link>
        <Link
          href="/orders"
          className="inline-flex rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          View my orders
        </Link>
      </div>
    </div>
  );
}
