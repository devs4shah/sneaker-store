"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartSummary } from "@/components/cart/CartSummary";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { PaymentStatusOverlay } from "@/components/checkout/PaymentStatusOverlay";
import { SneakerImage } from "@/components/products/SneakerImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import {
  getPaymentFailureReason,
  PaymentDismissedError,
  PaymentFailedError,
  processOrderPayment,
} from "@/lib/checkoutPayment";
import { formatPrice } from "@/lib/format";
import type { CheckoutFormValues } from "@/lib/validations/checkout";
import { orderService } from "@/services/orderService";
import { paymentService } from "@/services/paymentService";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import type { Order } from "@/types/order";
import type { PaymentPhase } from "@/types/payment";

export function CheckoutView() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const cart = useCartStore((s) => s.cart);
  const totalItems = useCartStore((s) => s.totalItems);
  const subtotal = useCartStore((s) => s.subtotal);
  const isLoading = useCartStore((s) => s.isLoading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const applyCart = useCartStore((s) => s.applyCart);

  const [serverError, setServerError] = useState<string | null>(null);
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>("idle");

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin");
      return;
    }
    void fetchCart();
  }, [fetchCart, isAdmin, router]);

  if (isAdmin) {
    return null;
  }

  const isProcessing = paymentPhase !== "idle";

  const handlePaymentFailure = async (orderId: string, error: unknown) => {
    const reason = getPaymentFailureReason(error);
    try {
      await paymentService.reportPaymentFailure({ orderId, reason });
    } catch {
      // Best-effort; still navigate to failure page.
    }
    const params = new URLSearchParams({ orderId, reason });
    router.push(`/checkout/failure?${params.toString()}`);
  };

  const handleCheckout = async (values: CheckoutFormValues) => {
    setServerError(null);
    setPaymentPhase("creating_order");

    let createdOrder: Order | null = null;

    try {
      createdOrder = await orderService.checkout(values);
      applyCart({
        id: cart?.id ?? "",
        items: [],
        totalItems: 0,
        subtotal: 0,
      });

      await processOrderPayment(createdOrder, user, {
        onPhaseChange: setPaymentPhase,
      });

      router.push(`/checkout/success?orderId=${createdOrder.id}`);
    } catch (err) {
      if (createdOrder) {
        if (err instanceof PaymentDismissedError || err instanceof PaymentFailedError) {
          await handlePaymentFailure(createdOrder.id, err);
        } else {
          const reason = getApiErrorMessage(err, "Payment could not be completed.");
          const params = new URLSearchParams({ orderId: createdOrder.id, reason });
          router.push(`/checkout/failure?${params.toString()}`);
        }
        return;
      }

      setServerError(getApiErrorMessage(err, "Checkout failed"));
    } finally {
      setPaymentPhase("idle");
    }
  };

  if (isLoading && !cart) {
    return <LoadingState message="Preparing checkout..." />;
  }

  const items = cart?.items ?? [];

  if (!isLoading && items.length === 0) {
    return (
      <EmptyState
        title="Nothing to checkout"
        description="Add items to your cart before placing an order."
        action={
          <Link
            href="/sneakers"
            className="inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            Shop sneakers
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PaymentStatusOverlay phase={paymentPhase} />

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">Checkout</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Enter shipping details and pay securely with Razorpay.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <CheckoutForm
              onSubmit={handleCheckout}
              serverError={serverError}
              isProcessing={isProcessing}
            />
          </section>

          <div className="space-y-6">
            <aside className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Items</h2>
              <ul className="mt-4 space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
                      <SneakerImage src={item.imageUrl} alt={item.sneakerName} sizes="64px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100">
                        {item.sneakerName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        Qty {item.quantity} · {formatPrice(item.currentUnitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                      {formatPrice(item.lineSubtotal)}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>

            <CartSummary
              subtotal={subtotal}
              totalItems={totalItems}
              showCheckoutButton={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}
