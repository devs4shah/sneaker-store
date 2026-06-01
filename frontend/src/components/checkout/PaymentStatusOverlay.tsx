"use client";

import type { PaymentPhase } from "@/types/payment";

const PHASE_MESSAGES: Record<Exclude<PaymentPhase, "idle">, string> = {
  creating_order: "Creating your order...",
  creating_payment: "Preparing secure payment...",
  awaiting_payment: "Complete payment in the Razorpay window",
  verifying: "Verifying your payment...",
};

interface PaymentStatusOverlayProps {
  phase: PaymentPhase;
}

export function PaymentStatusOverlay({ phase }: PaymentStatusOverlayProps) {
  if (phase === "idle") {
    return null;
  }

  const message = PHASE_MESSAGES[phase];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 dark:border-brand-900 dark:border-t-brand-400" />
        <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-zinc-100">{message}</p>
        <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
          Please do not close this page until payment is complete.
        </p>
      </div>
    </div>
  );
}
