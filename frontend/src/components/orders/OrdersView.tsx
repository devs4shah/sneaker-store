"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { OrderCard } from "@/components/orders/OrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Alert } from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/lib/apiClient";
import { orderService } from "@/services/orderService";
import { useAuthStore } from "@/store/authStore";
import type { Order } from "@/types/order";

export function OrdersView() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin());

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await orderService.getMyOrdersWithItems(0, 50);
      setOrders(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load your orders"));
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login?callbackUrl=/orders");
      return;
    }
    void loadOrders();
  }, [isAuthenticated, loadOrders, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">My Orders</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            View your past purchases, payment status, and order details.
          </p>
        </div>
        {!isAdmin ? (
          <Link
            href="/sneakers"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            Continue shopping
          </Link>
        ) : null}
      </div>

      {isLoading ? <LoadingState message="Loading your orders..." /> : null}

      {!isLoading && error ? (
        <div className="space-y-4">
          <Alert variant="error" message={error} />
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!isLoading && !error && orders.length === 0 ? (
        <EmptyState
          title="You have not placed any orders yet."
          description="When you complete a purchase, your orders will appear here."
          action={
            <Link
              href="/sneakers"
              className="inline-flex rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              Browse sneakers
            </Link>
          }
        />
      ) : null}

      {!isLoading && !error && orders.length > 0 ? (
        <ul className="space-y-6">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
