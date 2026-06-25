"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { LoadingState } from "@/components/ui/LoadingState";
import { addressToCheckoutValues, formatAddressSummary } from "@/lib/address";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validations/checkout";
import type { Address } from "@/types/address";

const MANUAL_ADDRESS_ID = "manual";

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => Promise<void>;
  serverError: string | null;
  isProcessing?: boolean;
  addresses?: Address[];
  addressesLoading?: boolean;
}

export function CheckoutForm({
  onSubmit,
  serverError,
  isProcessing = false,
  addresses = [],
  addressesLoading = false,
}: CheckoutFormProps) {
  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses],
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string>(MANUAL_ADDRESS_ID);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });

  useEffect(() => {
    if (addressesLoading) {
      return;
    }

    if (addresses.length === 0) {
      setSelectedAddressId(MANUAL_ADDRESS_ID);
      return;
    }

    setSelectedAddressId((current) => {
      if (current !== MANUAL_ADDRESS_ID && addresses.some((address) => address.id === current)) {
        return current;
      }
      return defaultAddress?.id ?? MANUAL_ADDRESS_ID;
    });
  }, [addresses, addressesLoading, defaultAddress]);

  useEffect(() => {
    if (selectedAddressId === MANUAL_ADDRESS_ID) {
      return;
    }

    const selected = addresses.find((address) => address.id === selectedAddressId);
    if (selected) {
      reset(addressToCheckoutValues(selected));
    }
  }, [addresses, reset, selectedAddressId]);

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);

    if (addressId === MANUAL_ADDRESS_ID) {
      reset({
        shippingAddress: "",
        city: "",
        postalCode: "",
        country: "",
      });
      return;
    }

    const selected = addresses.find((address) => address.id === addressId);
    if (selected) {
      reset(addressToCheckoutValues(selected));
    }
  };

  const selectedSavedAddress =
    selectedAddressId !== MANUAL_ADDRESS_ID
      ? addresses.find((address) => address.id === selectedAddressId)
      : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Shipping address</h2>
        <Link
          href="/dashboard/addresses"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Manage addresses
        </Link>
      </div>

      <Alert variant="error" message={serverError ?? ""} />

      {addressesLoading ? <LoadingState message="Loading saved addresses..." /> : null}

      {!addressesLoading && addresses.length > 0 ? (
        <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-zinc-700">
          <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">Choose a saved address</p>
          <div className="space-y-2">
            {addresses.map((address) => (
              <label
                key={address.id}
                className="flex cursor-pointer gap-3 rounded-lg border border-gray-200 px-3 py-3 transition hover:border-gray-300 dark:border-zinc-700 dark:hover:border-zinc-600"
              >
                <input
                  type="radio"
                  name="checkout-address"
                  className="mt-1 h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800"
                  checked={selectedAddressId === address.id}
                  onChange={() => handleAddressSelection(address.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-zinc-100">{address.fullName}</span>
                    {address.isDefault ? (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                        Default
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block whitespace-pre-wrap text-sm text-gray-600 dark:text-zinc-400">
                    {formatAddressSummary(address)}
                  </span>
                </span>
              </label>
            ))}

            <label className="flex cursor-pointer gap-3 rounded-lg border border-gray-200 px-3 py-3 transition hover:border-gray-300 dark:border-zinc-700 dark:hover:border-zinc-600">
              <input
                type="radio"
                name="checkout-address"
                className="mt-1 h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800"
                checked={selectedAddressId === MANUAL_ADDRESS_ID}
                onChange={() => handleAddressSelection(MANUAL_ADDRESS_ID)}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                Enter a new address
              </span>
            </label>
          </div>
        </div>
      ) : null}

      {selectedSavedAddress ? (
        <>
          <input type="hidden" {...register("shippingAddress")} />
          <input type="hidden" {...register("city")} />
          <input type="hidden" {...register("postalCode")} />
          <input type="hidden" {...register("country")} />
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
            Delivering to the selected saved address above.
          </div>
        </>
      ) : (
        <>
          <FormField
            label="Street address"
            autoComplete="street-address"
            placeholder="123 Main St, Apt 4"
            error={errors.shippingAddress?.message}
            {...register("shippingAddress")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="City"
              autoComplete="address-level2"
              placeholder="New York"
              error={errors.city?.message}
              {...register("city")}
            />
            <FormField
              label="Postal code"
              autoComplete="postal-code"
              placeholder="10001"
              error={errors.postalCode?.message}
              {...register("postalCode")}
            />
          </div>

          <FormField
            label="Country"
            autoComplete="country-name"
            placeholder="United States"
            error={errors.country?.message}
            {...register("country")}
          />
        </>
      )}

      <SubmitButton label="Pay now" isLoading={isProcessing} />
    </form>
  );
}
