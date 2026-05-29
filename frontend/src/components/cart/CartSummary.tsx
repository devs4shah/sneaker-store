"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";

interface CartSummaryProps {
  subtotal: number;
  totalItems: number;
  isLoading?: boolean;
  checkoutHref?: string;
  showCheckoutButton?: boolean;
}

export function CartSummary({
  subtotal,
  totalItems,
  isLoading = false,
  checkoutHref = "/checkout",
  showCheckoutButton = true,
}: CartSummaryProps) {
  const itemLabel = totalItems === 1 ? "item" : "items";

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
        <div className="flex justify-between text-gray-600 dark:text-zinc-400">
          <dt>Shipping</dt>
          <dd className="font-medium text-gray-900 dark:text-zinc-100">Calculated at checkout</dd>
        </div>
      </dl>

      <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 dark:border-zinc-800">
        <dt className="text-base font-semibold text-gray-900 dark:text-zinc-100">Total</dt>
        <dd className="text-xl font-bold text-gray-900 dark:text-zinc-100">
          {isLoading ? "—" : formatPrice(subtotal)}
        </dd>
      </div>

      {showCheckoutButton ? (
        <Link
          href={checkoutHref}
          className={`mt-6 flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 ${
            totalItems === 0 || isLoading
              ? "pointer-events-none cursor-not-allowed opacity-50"
              : ""
          }`}
          aria-disabled={totalItems === 0 || isLoading}
          tabIndex={totalItems === 0 || isLoading ? -1 : 0}
        >
          Proceed to checkout
        </Link>
      ) : null}

      <Link
        href="/sneakers"
        className="mt-3 block text-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Continue shopping
      </Link>
    </aside>
  );
}
