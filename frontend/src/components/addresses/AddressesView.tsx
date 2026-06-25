"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AddressForm, addressToFormValues } from "@/components/addresses/AddressForm";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatAddressSummary } from "@/lib/address";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { AddressFormValues } from "@/lib/validations/address";
import { addressService } from "@/services/addressService";
import type { Address } from "@/types/address";

type FormMode = "closed" | "create" | { editId: string };

export function AddressesView() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>("closed");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, "Failed to load addresses"));
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const handleCreate = async (values: AddressFormValues) => {
    setActionMessage(null);
    setActionError(null);
    try {
      await addressService.createAddress({
        ...values,
        addressLine2: values.addressLine2 || undefined,
      });
      setFormMode("closed");
      setActionMessage("Address added successfully.");
      await loadAddresses();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to add address"));
    }
  };

  const handleUpdate = async (id: string, values: AddressFormValues) => {
    setActionMessage(null);
    setActionError(null);
    try {
      await addressService.updateAddress(id, {
        ...values,
        addressLine2: values.addressLine2 || undefined,
      });
      setFormMode("closed");
      setActionMessage("Address updated successfully.");
      await loadAddresses();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to update address"));
    }
  };

  const handleDelete = async (id: string) => {
    setActionMessage(null);
    setActionError(null);
    setBusyId(id);
    try {
      await addressService.deleteAddress(id);
      setActionMessage("Address deleted.");
      if (formMode !== "closed" && formMode !== "create" && formMode.editId === id) {
        setFormMode("closed");
      }
      await loadAddresses();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to delete address"));
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setActionMessage(null);
    setActionError(null);
    setBusyId(id);
    try {
      await addressService.setDefaultAddress(id);
      setActionMessage("Default address updated.");
      await loadAddresses();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to set default address"));
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading addresses..." />;
  }

  if (loadError) {
    return <ErrorState message={loadError} onRetry={loadAddresses} />;
  }

  const editingAddress =
    formMode !== "closed" && formMode !== "create"
      ? addresses.find((address) => address.id === formMode.editId)
      : null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Shipping
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-zinc-100">Saved addresses</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
          Add and manage delivery addresses for faster checkout.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Back to dashboard
          </Link>
          <Link
            href="/dashboard/profile"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Edit profile
          </Link>
        </div>
      </div>

      <Alert variant="success" message={actionMessage ?? ""} />
      <Alert variant="error" message={actionError ?? ""} />

      {formMode === "create" ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Add address</h2>
          <div className="mt-4">
            <AddressForm
              submitLabel="Save address"
              onSubmit={handleCreate}
              onCancel={() => setFormMode("closed")}
            />
          </div>
        </section>
      ) : null}

      {editingAddress ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Edit address</h2>
          <div className="mt-4">
            <AddressForm
              initialValues={addressToFormValues(editingAddress)}
              submitLabel="Update address"
              onSubmit={(values) => handleUpdate(editingAddress.id, values)}
              onCancel={() => setFormMode("closed")}
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Your addresses</h2>
          {formMode === "closed" ? (
            <button
              type="button"
              onClick={() => setFormMode("create")}
              className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              Add address
            </button>
          ) : null}
        </div>

        {addresses.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No saved addresses"
              description="Add an address to speed up checkout."
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="rounded-xl border border-gray-200 p-4 dark:border-zinc-700"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-zinc-100">{address.fullName}</p>
                      {address.isDefault ? (
                        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-gray-600 dark:text-zinc-400">
                      {formatAddressSummary(address)}
                    </pre>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!address.isDefault ? (
                      <button
                        type="button"
                        disabled={busyId === address.id}
                        onClick={() => void handleSetDefault(address.id)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        Set default
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setFormMode({ editId: address.id })}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busyId === address.id}
                      onClick={() => void handleDelete(address.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
