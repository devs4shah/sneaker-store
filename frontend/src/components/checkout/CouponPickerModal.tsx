"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatPrice } from "@/lib/format";
import { couponService } from "@/services/couponService";
import type { AvailableCoupon } from "@/types/coupon";

interface CouponPickerModalProps {
  cartTotal: number;
  appliedCouponCodes: string[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
}

function describeCoupon(coupon: AvailableCoupon): string {
  if (coupon.couponType === "PERCENTAGE") {
    const cap =
      coupon.maximumDiscount != null ? ` (max ${formatPrice(coupon.maximumDiscount)})` : "";
    return `${coupon.discountValue}% off${cap}`;
  }
  return `${formatPrice(coupon.discountValue)} off`;
}

export function CouponPickerModal({
  cartTotal,
  appliedCouponCodes,
  isOpen,
  onClose,
  onSelect,
}: CouponPickerModalProps) {
  const [coupons, setCoupons] = useState<AvailableCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadCoupons = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await couponService.getAvailableCoupons(cartTotal, appliedCouponCodes);
        setCoupons(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load coupons"));
        setCoupons([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCoupons();
  }, [appliedCouponCodes, cartTotal, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close coupon picker"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-picker-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
          <h2 id="coupon-picker-title" className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
            Choose coupons
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            Close
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {appliedCouponCodes.length > 0 ? (
            <p className="mb-4 text-xs text-gray-500 dark:text-zinc-400">
              {appliedCouponCodes.length} coupon{appliedCouponCodes.length === 1 ? "" : "s"} already applied.
              You can add more eligible coupons.
            </p>
          ) : null}

          {isLoading ? <LoadingState message="Loading coupons..." /> : null}

          {!isLoading && error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          ) : null}

          {!isLoading && !error && coupons.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              No more coupons are available for this order.
            </p>
          ) : null}

          {!isLoading && !error && coupons.length > 0 ? (
            <ul className="space-y-3">
              {coupons.map((coupon) => (
                <li key={coupon.code}>
                  <button
                    type="button"
                    disabled={!coupon.applicable}
                    onClick={() => {
                      onSelect(coupon.code);
                    }}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      coupon.applicable
                        ? "border-gray-200 hover:border-brand-500 hover:bg-brand-50 dark:border-zinc-700 dark:hover:border-brand-500 dark:hover:bg-brand-950/20"
                        : "cursor-not-allowed border-gray-200 opacity-60 dark:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-zinc-100">{coupon.code}</p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
                          {describeCoupon(coupon)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">
                          Min. order {formatPrice(coupon.minimumOrderAmount)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          coupon.applicable
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {coupon.applicable ? "Add" : "Not eligible"}
                      </span>
                    </div>
                    {!coupon.applicable && coupon.unavailableReason ? (
                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                        {coupon.unavailableReason}
                      </p>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
