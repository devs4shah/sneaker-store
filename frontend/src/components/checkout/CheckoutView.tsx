"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartSummary } from "@/components/cart/CartSummary";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { SneakerImage } from "@/components/products/SneakerImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatPrice } from "@/lib/format";
import type { CheckoutFormValues } from "@/lib/validations/checkout";
import { orderService } from "@/services/orderService";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import type { Order } from "@/types/order";

export function CheckoutView() {
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const cart = useCartStore((s) => s.cart);
  const totalItems = useCartStore((s) => s.totalItems);
  const subtotal = useCartStore((s) => s.subtotal);
  const isLoading = useCartStore((s) => s.isLoading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const applyCart = useCartStore((s) => s.applyCart);

  const [serverError, setServerError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

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

  const handleCheckout = async (values: CheckoutFormValues) => {
    setServerError(null);

    try {
      const order = await orderService.checkout(values);
      setPlacedOrder(order);
      applyCart({
        id: cart?.id ?? "",
        items: [],
        totalItems: 0,
        subtotal: 0,
      });
    } catch (err) {
      setServerError(getApiErrorMessage(err, "Checkout failed"));
    }
  };

  if (isLoading && !cart) {
    return <LoadingState message="Preparing checkout..." />;
  }

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-6 py-10 dark:border-brand-900/50 dark:bg-brand-950/30">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-400">
            Order confirmed
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-zinc-100">
            Thank you for your order
          </h1>
          <p className="mt-3 text-gray-600 dark:text-zinc-400">
            Order <span className="font-semibold text-gray-900 dark:text-zinc-100">{placedOrder.orderNumber}</span>{" "}
            was placed successfully.
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-zinc-100">
            {formatPrice(placedOrder.totalAmount)}
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">
            Shipping to {placedOrder.shippingAddress}, {placedOrder.city},{" "}
            {placedOrder.postalCode}, {placedOrder.country}
          </p>
        </div>
        <Link
          href="/sneakers"
          className="inline-flex rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          Continue shopping
        </Link>
      </div>
    );
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">Checkout</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Enter your shipping details to complete your order.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <CheckoutForm onSubmit={handleCheckout} serverError={serverError} />
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
  );
}
