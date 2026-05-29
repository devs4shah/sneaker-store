"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Alert } from "@/components/ui/Alert";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export function CartView() {
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const cart = useCartStore((s) => s.cart);
  const totalItems = useCartStore((s) => s.totalItems);
  const subtotal = useCartStore((s) => s.subtotal);
  const isLoading = useCartStore((s) => s.isLoading);
  const isMutating = useCartStore((s) => s.isMutating);
  const error = useCartStore((s) => s.error);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

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

  if (isLoading && !cart) {
    return <LoadingState message="Loading your cart..." />;
  }

  if (error && !cart) {
    return <ErrorState message={error} onRetry={() => void fetchCart()} />;
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">Your cart</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            {totalItems > 0
              ? `${totalItems} item${totalItems === 1 ? "" : "s"} ready for checkout`
              : "Your cart is empty"}
          </p>
        </div>
        {!isEmpty ? (
          <button
            type="button"
            disabled={isMutating}
            onClick={() => void clearCart()}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Clear cart
          </button>
        ) : null}
      </div>

      {error ? <Alert variant="error" message={error} /> : null}

      {isEmpty ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse our collection and add sneakers you love."
          action={
            <Link
              href="/sneakers"
              className="inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              Shop sneakers
            </Link>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="space-y-4" aria-label="Cart items">
            {items.map((item) => (
              <li key={item.id}>
                <CartItem
                  item={item}
                  disabled={isMutating}
                  onUpdateQuantity={updateItemQuantity}
                  onRemove={removeItem}
                />
              </li>
            ))}
          </ul>

          <CartSummary subtotal={subtotal} totalItems={totalItems} isLoading={isMutating} />
        </div>
      )}
    </div>
  );
}
