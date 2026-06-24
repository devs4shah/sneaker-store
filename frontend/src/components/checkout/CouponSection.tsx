"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { CouponPickerModal } from "@/components/checkout/CouponPickerModal";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatPrice } from "@/lib/format";
import { couponService } from "@/services/couponService";
import type { AppliedCouponsState } from "@/types/coupon";

interface CouponSectionProps {
  cartTotal: number;
  appliedCoupons: AppliedCouponsState | null;
  onApply: (state: AppliedCouponsState | null) => void;
  disabled?: boolean;
}

export function CouponSection({
  cartTotal,
  appliedCoupons,
  onApply,
  disabled = false,
}: CouponSectionProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const appliedCodes = useMemo(
    () => appliedCoupons?.coupons.map((coupon) => coupon.couponCode) ?? [],
    [appliedCoupons],
  );

  const validateAndApply = async (codes: string[]) => {
    setIsApplying(true);
    setErrorMessage(null);

    try {
      const result = await couponService.validateCoupons({
        couponCodes: codes,
        cartTotal,
      });

      if (!result.valid) {
        setErrorMessage(result.message ?? "Coupon invalid");
        return false;
      }

      onApply({
        coupons: result.appliedCoupons,
        totalDiscount: result.discount,
        finalAmount: result.finalAmount,
      });
      setCouponCode("");
      return true;
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Could not validate coupons"));
      return false;
    } finally {
      setIsApplying(false);
    }
  };

  const handleApply = async () => {
    const trimmed = couponCode.trim();
    if (!trimmed) {
      setErrorMessage("Enter a coupon code.");
      return;
    }

    if (appliedCodes.some((code) => code.toUpperCase() === trimmed.toUpperCase())) {
      setErrorMessage("Coupon already applied.");
      return;
    }

    await validateAndApply([...appliedCodes, trimmed]);
  };

  const handlePickerSelect = async (code: string) => {
    if (appliedCodes.some((existing) => existing.toUpperCase() === code.toUpperCase())) {
      setErrorMessage("Coupon already applied.");
      setIsPickerOpen(false);
      return;
    }

    const success = await validateAndApply([...appliedCodes, code]);
    if (success) {
      setIsPickerOpen(false);
    }
  };

  const handleRemove = async (codeToRemove: string) => {
    const remaining = appliedCodes.filter((code) => code !== codeToRemove);
    if (remaining.length === 0) {
      onApply(null);
      setErrorMessage(null);
      return;
    }

    await validateAndApply(remaining);
  };

  const handleClearAll = () => {
    setCouponCode("");
    setErrorMessage(null);
    onApply(null);
  };

  const hasAppliedCoupons = (appliedCoupons?.coupons.length ?? 0) > 0;

  return (
    <>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Coupon Codes</h2>
          {hasAppliedCoupons ? (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={disabled || isApplying}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Remove all
            </button>
          ) : null}
        </div>

        {hasAppliedCoupons ? (
          <ul className="mt-4 space-y-2">
            {appliedCoupons?.coupons.map((coupon) => (
              <li
                key={coupon.couponCode}
                className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/30"
              >
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    ✓ {coupon.couponCode}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Saved {formatPrice(coupon.discountAmount)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRemove(coupon.couponCode)}
                  disabled={disabled || isApplying}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 disabled:opacity-50 dark:text-emerald-300"
                >
                  Remove
                </button>
              </li>
            ))}
            <li className="rounded-lg border border-emerald-200/70 bg-emerald-50/60 px-4 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
              Total saved {formatPrice(appliedCoupons?.totalDiscount ?? 0)}
            </li>
          </ul>
        ) : null}

        <div className={`space-y-4 ${hasAppliedCoupons ? "mt-4" : "mt-4"}`}>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              disabled={disabled || isApplying}
              className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm text-gray-500 transition hover:border-brand-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-brand-500"
            >
              <span>Browse available coupons</span>
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Browse</span>
            </button>

            <input
              type="text"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              placeholder="Or type another coupon code"
              disabled={disabled || isApplying}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={disabled || isApplying}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600 sm:w-auto"
          >
            {isApplying ? "Applying..." : hasAppliedCoupons ? "Add Coupon" : "Apply Coupon"}
          </button>

          {errorMessage ? (
            <div className="pt-1">
              <Alert variant="error" message={errorMessage} />
            </div>
          ) : null}
        </div>
      </section>

      <CouponPickerModal
        cartTotal={cartTotal}
        appliedCouponCodes={appliedCodes}
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(code) => void handlePickerSelect(code)}
      />
    </>
  );
}
