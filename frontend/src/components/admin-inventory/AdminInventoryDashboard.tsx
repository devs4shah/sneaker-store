"use client";

import { useEffect, useMemo, useState } from "react";
import { StockBadge } from "@/components/products/StockBadge";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatPrice } from "@/lib/format";
import { adminInventoryService } from "@/services/adminInventoryService";
import type { InventoryItem, InventoryPageResponse } from "@/types/adminInventory";

const PAGE_SIZE = 15;

export function AdminInventoryDashboard() {
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<InventoryPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftQuantity, setDraftQuantity] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminInventoryService.getInventory(page, PAGE_SIZE);
      setResult(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load inventory"));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInventory();
  }, [page]);

  const filteredItems = useMemo(() => {
    let items = result?.content ?? [];
    const q = search.trim().toLowerCase();

    if (q) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q),
      );
    }

    if (lowStockOnly) {
      items = items.filter((item) => item.lowStock || item.outOfStock);
    }

    return items;
  }, [lowStockOnly, result?.content, search]);

  const lowStockCount = useMemo(
    () => (result?.content ?? []).filter((item) => item.lowStock || item.outOfStock).length,
    [result?.content],
  );

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.sneakerId);
    setDraftQuantity(String(item.stockQuantity));
    setActionMessage(null);
    setActionError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftQuantity("");
  };

  const saveStock = async (item: InventoryItem) => {
    const quantity = Number(draftQuantity);
    if (!Number.isInteger(quantity) || quantity < 0) {
      setActionError("Enter a whole number greater than or equal to 0.");
      return;
    }

    setSavingId(item.sneakerId);
    setActionMessage(null);
    setActionError(null);

    try {
      const updated = await adminInventoryService.updateStock(item.sneakerId, {
        stockQuantity: quantity,
      });
      setResult((current) => {
        if (!current) return current;
        return {
          ...current,
          content: current.content.map((row) =>
            row.sneakerId === updated.sneakerId ? updated : row,
          ),
        };
      });
      setActionMessage(`Updated stock for ${updated.name}.`);
      cancelEdit();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not update stock"));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Admin area
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Inventory management</h1>
        <p className="text-sm text-gray-600 dark:text-zinc-400">
          Monitor stock levels, update quantities, and spot low-stock products.
        </p>
      </div>

      {lowStockCount > 0 ? (
        <Alert
          variant="warning"
          message={`${lowStockCount} product${lowStockCount === 1 ? "" : "s"} on this page need attention (low or out of stock).`}
        />
      ) : null}

      {actionMessage ? <Alert variant="success" message={actionMessage} /> : null}
      {actionError ? <Alert variant="error" message={actionError} /> : null}

      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2 lg:grid-cols-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, brand, category..."
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(event) => setLowStockOnly(event.target.checked)}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          Show low / out of stock only
        </label>
      </div>

      {isLoading ? <LoadingState message="Loading inventory..." /> : null}

      {!isLoading && error ? (
        <ErrorState title="Could not load inventory" message={error} onRetry={() => void loadInventory()} />
      ) : null}

      {!isLoading && !error && filteredItems.length === 0 ? (
        <EmptyState
          title="No inventory items found"
          description="Try changing your search or filters."
        />
      ) : null}

      {!isLoading && !error && filteredItems.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-zinc-800">
            <thead className="bg-gray-50 dark:bg-zinc-900/80">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">Product</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">Price</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">Stock</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {filteredItems.map((item) => {
                const isEditing = editingId === item.sneakerId;
                const isSaving = savingId === item.sneakerId;

                return (
                  <tr key={item.sneakerId} className={item.lowStock || item.outOfStock ? "bg-amber-50/40 dark:bg-amber-950/10" : undefined}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-zinc-100">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400">{item.brand}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-zinc-400">{item.categoryName}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-zinc-100">{formatPrice(item.price)}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={draftQuantity}
                          onChange={(event) => setDraftQuantity(event.target.value)}
                          className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                      ) : (
                        <span className="font-semibold text-gray-900 dark:text-zinc-100">{item.stockQuantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge stockQuantity={item.stockQuantity} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void saveStock(item)}
                            disabled={isSaving}
                            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isSaving}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-zinc-600 dark:text-zinc-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          Update stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {!isLoading && !error && result && result.totalPages > 1 ? (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Page {result.page + 1} of {result.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={result.last}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
