"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatPrice } from "@/lib/format";
import { adminCouponService } from "@/services/adminCouponService";
import type {
  Coupon,
  CouponPageResponse,
  CouponType,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types/coupon";

const PAGE_SIZE = 10;

type FormMode = "create" | "edit" | null;

interface CouponFormState {
  code: string;
  couponType: CouponType;
  discountValue: string;
  minimumOrderAmount: string;
  maximumDiscount: string;
  usageLimit: string;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

const emptyForm = (): CouponFormState => ({
  code: "",
  couponType: "PERCENTAGE",
  discountValue: "",
  minimumOrderAmount: "0",
  maximumDiscount: "",
  usageLimit: "",
  validFrom: "",
  validUntil: "",
  active: true,
});

function toDateTimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoInstant(value: string): string {
  return new Date(value).toISOString();
}

function formFromCoupon(coupon: Coupon): CouponFormState {
  return {
    code: coupon.code,
    couponType: coupon.couponType,
    discountValue: String(coupon.discountValue),
    minimumOrderAmount: String(coupon.minimumOrderAmount),
    maximumDiscount: coupon.maximumDiscount != null ? String(coupon.maximumDiscount) : "",
    usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
    validFrom: toDateTimeLocalValue(coupon.validFrom),
    validUntil: toDateTimeLocalValue(coupon.validUntil),
    active: coupon.active,
  };
}

function buildCreatePayload(form: CouponFormState): CreateCouponPayload {
  return {
    code: form.code.trim(),
    couponType: form.couponType,
    discountValue: Number(form.discountValue),
    minimumOrderAmount: Number(form.minimumOrderAmount || 0),
    maximumDiscount:
      form.couponType === "PERCENTAGE" && form.maximumDiscount
        ? Number(form.maximumDiscount)
        : null,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    validFrom: toIsoInstant(form.validFrom),
    validUntil: toIsoInstant(form.validUntil),
    active: form.active,
  };
}

function buildUpdatePayload(form: CouponFormState): UpdateCouponPayload {
  return {
    code: form.code.trim(),
    couponType: form.couponType,
    discountValue: Number(form.discountValue),
    minimumOrderAmount: Number(form.minimumOrderAmount || 0),
    maximumDiscount:
      form.couponType === "PERCENTAGE" && form.maximumDiscount
        ? Number(form.maximumDiscount)
        : null,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    validFrom: toIsoInstant(form.validFrom),
    validUntil: toIsoInstant(form.validUntil),
    active: form.active,
  };
}

export function AdminCouponDashboard() {
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<CouponPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponFormState>(emptyForm());
  const [isSaving, setIsSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCoupons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminCouponService.getCoupons(page, PAGE_SIZE);
      setResult(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load coupons"));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCoupons();
  }, [page]);

  const filteredCoupons = useMemo(() => {
    const items = result?.content ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((coupon) => coupon.code.toLowerCase().includes(q));
  }, [result?.content, search]);

  const openCreateForm = () => {
    setFormMode("create");
    setEditingCoupon(null);
    setForm(emptyForm());
    setActionMessage(null);
    setActionError(null);
  };

  const openEditForm = (coupon: Coupon) => {
    setFormMode("edit");
    setEditingCoupon(coupon);
    setForm(formFromCoupon(coupon));
    setActionMessage(null);
    setActionError(null);
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingCoupon(null);
    setForm(emptyForm());
    setActionError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setActionMessage(null);
    setActionError(null);

    try {
      if (formMode === "create") {
        await adminCouponService.createCoupon(buildCreatePayload(form));
        setActionMessage("Coupon created successfully.");
        setPage(0);
      } else if (formMode === "edit" && editingCoupon) {
        await adminCouponService.updateCoupon(editingCoupon.id, buildUpdatePayload(form));
        setActionMessage("Coupon updated successfully.");
      }
      closeForm();
      await loadCoupons();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not save coupon"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisable = async (coupon: Coupon) => {
    setActionMessage(null);
    setActionError(null);
    try {
      await adminCouponService.updateCoupon(coupon.id, { active: false });
      setActionMessage(`Disabled coupon ${coupon.code}.`);
      await loadCoupons();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not disable coupon"));
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}? This cannot be undone.`)) {
      return;
    }

    setDeletingId(coupon.id);
    setActionMessage(null);
    setActionError(null);

    try {
      await adminCouponService.deleteCoupon(coupon.id);
      setActionMessage(`Deleted coupon ${coupon.code}.`);
      await loadCoupons();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not delete coupon"));
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = result?.totalPages ?? 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-zinc-100">
            Coupon management
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">
            Create, edit, and disable promotional coupons for checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          Create coupon
        </button>
      </div>

      <Alert variant="success" message={actionMessage ?? ""} />
      <Alert variant="error" message={actionError ?? ""} />

      {formMode ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
            {formMode === "create" ? "New coupon" : `Edit ${editingCoupon?.code}`}
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-gray-700 dark:text-zinc-300">Code</span>
              <input
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium text-gray-700 dark:text-zinc-300">Type</span>
              <select
                value={form.couponType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    couponType: event.target.value as CouponType,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed amount</option>
              </select>
            </label>

            <label className="block text-sm">
              <span className="font-medium text-gray-700 dark:text-zinc-300">
                {form.couponType === "PERCENTAGE" ? "Discount (%)" : "Discount amount (₹)"}
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.discountValue}
                onChange={(event) =>
                  setForm((current) => ({ ...current, discountValue: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium text-gray-700 dark:text-zinc-300">Minimum order (₹)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minimumOrderAmount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, minimumOrderAmount: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>

            {form.couponType === "PERCENTAGE" ? (
              <label className="block text-sm">
                <span className="font-medium text-gray-700 dark:text-zinc-300">
                  Max discount (₹, optional)
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.maximumDiscount}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, maximumDiscount: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
            ) : null}

            <label className="block text-sm">
              <span className="font-medium text-gray-700 dark:text-zinc-300">Usage limit (optional)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={form.usageLimit}
                onChange={(event) =>
                  setForm((current) => ({ ...current, usageLimit: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium text-gray-700 dark:text-zinc-300">Valid from</span>
              <input
                type="datetime-local"
                value={form.validFrom}
                onChange={(event) =>
                  setForm((current) => ({ ...current, validFrom: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium text-gray-700 dark:text-zinc-300">Valid until</span>
              <input
                type="datetime-local"
                value={form.validUntil}
                onChange={(event) =>
                  setForm((current) => ({ ...current, validUntil: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>

            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((current) => ({ ...current, active: event.target.checked }))
                }
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="font-medium text-gray-700 dark:text-zinc-300">Active</span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {isSaving ? "Saving..." : "Save coupon"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={isSaving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by code..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 sm:max-w-sm"
        />

        {isLoading ? <LoadingState message="Loading coupons..." /> : null}
        {!isLoading && error ? <ErrorState message={error} onRetry={() => void loadCoupons()} /> : null}

        {!isLoading && !error && filteredCoupons.length === 0 ? (
          <EmptyState
            title="No coupons found"
            description="Create a coupon to offer discounts at checkout."
          />
        ) : null}

        {!isLoading && !error && filteredCoupons.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Value</th>
                  <th className="px-3 py-2">Min order</th>
                  <th className="px-3 py-2">Usage</th>
                  <th className="px-3 py-2">Valid until</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-b border-gray-100 dark:border-zinc-800/80"
                  >
                    <td className="px-3 py-3 font-medium text-gray-900 dark:text-zinc-100">
                      {coupon.code}
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-zinc-400">{coupon.couponType}</td>
                    <td className="px-3 py-3 text-gray-600 dark:text-zinc-400">
                      {coupon.couponType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : formatPrice(coupon.discountValue)}
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-zinc-400">
                      {formatPrice(coupon.minimumOrderAmount)}
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-zinc-400">
                      {coupon.usedCount}
                      {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                    </td>
                    <td className="px-3 py-3 text-gray-600 dark:text-zinc-400">
                      {new Date(coupon.validUntil).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          coupon.active
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {coupon.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(coupon)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          Edit
                        </button>
                        {coupon.active ? (
                          <button
                            type="button"
                            onClick={() => void handleDisable(coupon)}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400"
                          >
                            Disable
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void handleDelete(coupon)}
                          disabled={deletingId === coupon.id}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
                        >
                          {deletingId === coupon.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && !error && totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-600"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-zinc-400">
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-zinc-600"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
