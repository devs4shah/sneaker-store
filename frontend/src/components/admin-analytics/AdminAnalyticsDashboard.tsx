"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StockBadge } from "@/components/products/StockBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatPrice } from "@/lib/format";
import { adminAnalyticsService } from "@/services/adminAnalyticsService";
import type { AdminAnalyticsData } from "@/types/adminAnalytics";

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-zinc-100">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function AnalyticsTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: ReactNode[][];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <EmptyState title="No data yet" description={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-zinc-700">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
          {rows.map((cells, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
              {cells.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="whitespace-nowrap px-3 py-3 text-gray-700 dark:text-zinc-300"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const analytics = await adminAnalyticsService.getAll();
      setData(analytics);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load analytics"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  if (isLoading) {
    return <LoadingState message="Loading analytics dashboard..." />;
  }

  if (error || !data) {
    return <ErrorState message={error ?? "Analytics data is unavailable"} onRetry={loadAnalytics} />;
  }

  const chartData = data.monthlySales.map((item) => ({
    month: item.month,
    revenue: Number(item.revenue),
    orders: item.orders,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Admin analytics
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-zinc-100">
          Store performance
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
          Revenue, sales trends, product performance, coupons, and inventory alerts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total revenue"
          value={formatPrice(Number(data.summary.totalRevenue))}
          hint="Paid orders only"
        />
        <SummaryCard label="Total orders" value={String(data.summary.totalOrders)} />
        <SummaryCard
          label="Total customers"
          value={String(data.summary.totalUsers)}
          hint="Registered users only (excludes admins)"
        />
        <SummaryCard label="Total products" value={String(data.summary.totalProducts)} />
      </div>

      <SectionCard
        title="Monthly sales"
        description="Revenue trend over the last 12 months"
      >
        {chartData.every((item) => item.revenue === 0) ? (
          <EmptyState
            title="No sales data"
            description="Paid orders will appear here once customers start checking out."
          />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-zinc-700" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  className="fill-gray-500 dark:fill-zinc-400"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: number) => formatPrice(value)}
                  className="fill-gray-500 dark:fill-zinc-400"
                  width={72}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const numericValue = Number(value ?? 0);
                    if (name === "revenue") {
                      return [formatPrice(numericValue), "Revenue"];
                    }
                    return [numericValue, "Orders"];
                  }}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid var(--tooltip-border, #e5e7eb)",
                  }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Customers"
        description={`${data.users.length} registered customer${data.users.length === 1 ? "" : "s"} — lifetime spend on paid orders`}
      >
        <AnalyticsTable
          headers={["Email", "Total spend"]}
          emptyMessage="No customer accounts registered yet."
          rows={data.users.map((user) => [
            user.email,
            formatPrice(Number(user.totalSpend)),
          ])}
        />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Top selling products" description="By units sold on paid orders">
          <AnalyticsTable
            headers={["Product", "Units sold", "Revenue"]}
            emptyMessage="No product sales recorded yet."
            rows={data.topProducts.map((product) => [
              product.sneakerName,
              String(product.quantitySold),
              formatPrice(Number(product.revenueGenerated)),
            ])}
          />
        </SectionCard>

        <SectionCard title="Top categories" description="By revenue from paid orders">
          <AnalyticsTable
            headers={["Category", "Units sold", "Revenue"]}
            emptyMessage="No category sales recorded yet."
            rows={data.topCategories.map((category) => [
              category.category,
              String(category.productsSold),
              formatPrice(Number(category.revenueGenerated)),
            ])}
          />
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Coupon performance" description="Usage on completed payments">
          <AnalyticsTable
            headers={["Coupon", "Uses", "Discount given"]}
            emptyMessage="No coupons have been applied to paid orders yet."
            rows={data.coupons.map((coupon) => [
              <span key={coupon.couponCode} className="font-medium text-brand-700 dark:text-brand-300">
                {coupon.couponCode}
              </span>,
              String(coupon.usageCount),
              formatPrice(Number(coupon.totalDiscountProvided)),
            ])}
          />
        </SectionCard>

        <SectionCard title="Revenue by payment status" description="Razorpay checkout breakdown">
          <AnalyticsTable
            headers={["Status", "Orders", "Revenue"]}
            emptyMessage="No payment activity recorded yet."
            rows={data.paymentBreakdown.map((item) => [
              item.paymentMethod,
              String(item.orderCount),
              formatPrice(Number(item.revenue)),
            ])}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Low stock alerts"
        description="Products with 5 or fewer units in stock"
      >
        {data.lowStock.length === 0 ? (
          <EmptyState
            title="All stocked up"
            description="No products are currently at or below the low-stock threshold."
          />
        ) : (
          <div className="space-y-3">
            {data.lowStock.map((item) => (
              <div
                key={item.sneakerId}
                className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/40 dark:bg-amber-950/20"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-zinc-100">{item.sneakerName}</p>
                  <p className="text-sm text-gray-600 dark:text-zinc-400">{item.brand}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StockBadge stockQuantity={item.stockQuantity} />
                  <Link
                    href="/admin/inventory"
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    Manage stock
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
