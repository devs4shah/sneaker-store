"use client";

import Link from "next/link";
import { useState } from "react";
import { SneakerImage } from "@/components/products/SneakerImage";
import { formatPrice } from "@/lib/format";
import type { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  item: CartItemType;
  disabled?: boolean;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
}

export function CartItem({ item, disabled = false, onUpdateQuantity, onRemove }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (nextQuantity: number) => {
    if (nextQuantity < 1 || nextQuantity === item.quantity) return;
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, nextQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemove(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const isDisabled = disabled || isUpdating;

  return (
    <article className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:gap-6 sm:p-5">
      <Link
        href={`/sneakers/${item.sneakerId}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800 sm:h-28 sm:w-28"
      >
        <SneakerImage
          src={item.imageUrl}
          alt={item.sneakerName}
          sizes="112px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              {item.brand}
            </p>
            <Link
              href={`/sneakers/${item.sneakerId}`}
              className="mt-0.5 block truncate text-base font-semibold text-gray-900 hover:underline dark:text-zinc-100"
            >
              {item.sneakerName}
            </Link>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              Size {item.size} · {formatPrice(item.currentUnitPrice)} each
            </p>
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-zinc-100">
            {formatPrice(item.lineSubtotal)}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center rounded-lg border border-gray-300 dark:border-zinc-600">
            <button
              type="button"
              disabled={isDisabled || item.quantity <= 1}
              onClick={() => void handleQuantityChange(item.quantity - 1)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-[2.5rem] px-2 text-center text-sm font-semibold text-gray-900 dark:text-zinc-100">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => void handleQuantityChange(item.quantity + 1)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={isDisabled}
            onClick={() => void handleRemove()}
            className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
