"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { AppliedCouponLine } from "@/types/coupon";

interface CheckoutOrderSummaryProps {
  subtotal: number;
  totalItems: number;
  appliedCoupons?: AppliedCouponLine[];
  totalDiscount?: number;
  finalTotal: number;
  isLoading?: boolean;
}

export function CheckoutOrderSummary({
  subtotal,
  totalItems,
  appliedCoupons = [],
  totalDiscount = 0,
  finalTotal,
  isLoading = false,
}: CheckoutOrderSummaryProps) {
  const itemLabel = totalItems === 1 ? "item" : "items";
  const hasDiscount = totalDiscount > 0;

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Order summary</h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-zinc-400">
          <dt>
            Subtotal ({totalItems} {itemLabel})
          </dt>
          <dd className="font-medium text-gray-900 dark:text-zinc-100">
            {isLoading ? "—" : formatPrice(subtotal)}
          </dd>
        </div>

        {appliedCoupons.map((coupon) => (
          <div
            key={coupon.couponCode}
            className="flex justify-between text-emerald-700 dark:text-emerald-400"
          >
            <dt>{coupon.couponCode}</dt>
            <dd className="font-medium">-{formatPrice(coupon.discountAmount)}</dd>
          </div>
        ))}

        {hasDiscount ? (
          <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-emerald-700 dark:border-zinc-700 dark:text-emerald-400">
            <dt>Total discount</dt>
            <dd className="font-semibold">-{formatPrice(totalDiscount)}</dd>
          </div>
        ) : null}

        <div className="flex justify-between text-gray-600 dark:text-zinc-400">
          <dt>Shipping</dt>
          <dd className="font-medium text-gray-900 dark:text-zinc-100">Free</dd>
        </div>
      </dl>

      <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 dark:border-zinc-800">
        <dt className="text-base font-semibold text-gray-900 dark:text-zinc-100">Final Total</dt>
        <dd className="text-xl font-bold text-gray-900 dark:text-zinc-100">
          {isLoading ? "—" : formatPrice(finalTotal)}
        </dd>
      </div>

      <Link
        href="/sneakers"
        className="mt-4 block text-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Continue shopping
      </Link>
    </aside>
  );
}
