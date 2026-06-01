"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PaymentStatusOverlay } from "@/components/checkout/PaymentStatusOverlay";
import { LoadingState } from "@/components/ui/LoadingState";
import { Alert } from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  getPaymentFailureReason,
  PaymentDismissedError,
  PaymentFailedError,
  processOrderPayment,
} from "@/lib/checkoutPayment";
import { formatPrice } from "@/lib/format";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { useAuthStore } from "@/store/authStore";
import type { Order } from "@/types/order";
import type { PaymentPhase } from "@/types/payment";

export function PaymentFailureView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const orderId = searchParams.get("orderId");
  const reasonParam = searchParams.get("reason");

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>("idle");

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
        if (fetched.paymentStatus === "PAID") {
          router.replace(`/checkout/success?orderId=${fetched.id}`);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load order details."));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [orderId, router]);

  const handleRetryPayment = async () => {
    if (!order) return;

    setRetryError(null);
    setPaymentPhase("creating_payment");

    try {
      const verified = await processOrderPayment(order, user, {
        onPhaseChange: setPaymentPhase,
      });
      setOrder(verified);
      router.push(`/checkout/success?orderId=${verified.id}`);
    } catch (err) {
      if (err instanceof PaymentDismissedError || err instanceof PaymentFailedError) {
        try {
          await paymentService.reportPaymentFailure({
            orderId: order.id,
            reason: getPaymentFailureReason(err),
          });
        } catch {
          // ignore
        }
      }
      setRetryError(getPaymentFailureReason(err));
    } finally {
      setPaymentPhase("idle");
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading order..." />;
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Payment issue</h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400">{error ?? "Order not found."}</p>
        <Link
          href="/checkout"
          className="inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Back to checkout
        </Link>
      </div>
    );
  }

  const failureReason =
    reasonParam?.trim() ||
    (order.paymentStatus === "FAILED"
      ? "Your payment could not be processed."
      : "Payment was not completed.");

  const isRetrying = paymentPhase !== "idle";

  return (
    <>
      <PaymentStatusOverlay phase={paymentPhase} />

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
            Payment failed
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-zinc-100">
            We could not confirm your payment
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-zinc-400">{failureReason}</p>
          <p className="mt-4 text-gray-600 dark:text-zinc-400">
            Order{" "}
            <span className="font-semibold text-gray-900 dark:text-zinc-100">{order.orderNumber}</span>{" "}
            · {formatPrice(order.totalAmount)}
          </p>
        </div>

        <Alert variant="error" message={retryError ?? ""} />

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => void handleRetryPayment()}
            disabled={isRetrying}
            className="inline-flex rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            {isRetrying ? "Processing..." : "Retry payment"}
          </button>
          <Link
            href="/cart"
            className="inline-flex rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Back to cart
          </Link>
          <Link
            href="/sneakers"
            className="inline-flex rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </>
  );
}
