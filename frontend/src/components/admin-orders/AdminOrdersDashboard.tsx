"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatDateTime, formatPrice } from "@/lib/format";
import { adminOrderService } from "@/services/adminOrderService";
import type {
  AdminOrderListItem,
  AdminOrderStatus,
  AdminPaymentStatus,
  PageResponse,
} from "@/types/adminOrder";
import { ADMIN_ORDER_STATUSES, ADMIN_PAYMENT_STATUSES } from "@/types/adminOrder";

const PAGE_SIZE = 10;

export function AdminOrdersDashboard() {
  const [query, setQuery] = useState("");
  const [orderStatus, setOrderStatus] = useState<AdminOrderStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<AdminPaymentStatus | "">("");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<PageResponse<AdminOrderListItem> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminOrderService.getOrders({
          page,
          size: PAGE_SIZE,
          ...(orderStatus ? { orderStatus } : {}),
          ...(paymentStatus ? { paymentStatus } : {}),
        });
        if (!cancelled) {
          setResult(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Failed to load admin orders"));
          setResult(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [orderStatus, page, paymentStatus]);

  useEffect(() => {
    setPage(0);
  }, [orderStatus, paymentStatus]);

  const filteredOrders = useMemo(() => {
    const items = result?.content ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      return (
        item.orderId.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.customerEmail.toLowerCase().includes(q)
      );
    });
  }, [query, result?.content]);

  const totalPages = result?.totalPages ?? 0;
  const isLast = result?.last ?? true;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Admin area
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Orders dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400">
          Track order lifecycle, payment state, and customer details.
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ID, customer, email"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />

        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus((e.target.value as AdminOrderStatus) || "")}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="">All order statuses</option>
          {ADMIN_ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus((e.target.value as AdminPaymentStatus) || "")}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="">All payment statuses</option>
          {ADMIN_PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <div className="text-sm text-gray-500 dark:text-zinc-400">
          <p>
            Page <span className="font-semibold text-gray-700 dark:text-zinc-200">{page + 1}</span>
            {totalPages ? ` of ${totalPages}` : ""}
          </p>
          <p className="mt-1">Server pagination and createdAt descending sort applied.</p>
        </div>
      </div>

      {isLoading ? <LoadingState message="Loading admin orders..." /> : null}
      {!isLoading && error ? <Alert variant="error" message={error} /> : null}

      {!isLoading && !error && (result?.content.length ?? 0) === 0 ? (
        <EmptyState title="No orders found." description="Try changing your filters." />
      ) : null}

      {!isLoading && !error && filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <article
              key={order.orderId}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="break-all text-xs font-mono text-gray-500 dark:text-zinc-400">
                    {order.orderId}
                  </p>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                    {order.customerName}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">{order.customerEmail}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-500">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <p className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <OrderStatusBadge kind="payment" status={order.paymentStatus} />
                    <OrderStatusBadge kind="order" status={order.orderStatus} />
                  </div>
                  <Link
                    href={`/admin/orders/${order.orderId}`}
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!isLoading && !error && (result?.content.length ?? 0) > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Total orders: {result?.totalElements ?? 0}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
