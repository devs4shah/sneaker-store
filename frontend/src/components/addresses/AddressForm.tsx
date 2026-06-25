"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { addressSchema, type AddressFormValues } from "@/lib/validations/address";
import type { Address } from "@/types/address";

interface AddressFormProps {
  initialValues?: Partial<AddressFormValues>;
  submitLabel: string;
  onSubmit: (values: AddressFormValues) => Promise<void>;
  onCancel?: () => void;
}

const emptyValues: AddressFormValues = {
  fullName: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

export function AddressForm({ initialValues, submitLabel, onSubmit, onCancel }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { ...emptyValues, ...initialValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <FormField
          label="Phone number"
          autoComplete="tel"
          error={errors.phoneNumber?.message}
          {...register("phoneNumber")}
        />
      </div>

      <FormField
        label="Address line 1"
        autoComplete="address-line1"
        error={errors.addressLine1?.message}
        {...register("addressLine1")}
      />
      <FormField
        label="Address line 2 (optional)"
        autoComplete="address-line2"
        error={errors.addressLine2?.message}
        {...register("addressLine2")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="City"
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register("city")}
        />
        <FormField
          label="State"
          autoComplete="address-level1"
          error={errors.state?.message}
          {...register("state")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Postal code"
          autoComplete="postal-code"
          error={errors.postalCode?.message}
          {...register("postalCode")}
        />
        <FormField
          label="Country"
          autoComplete="country-name"
          error={errors.country?.message}
          {...register("country")}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-zinc-600 dark:bg-zinc-800"
          {...register("isDefault")}
        />
        Set as default address
      </label>

      <div className="flex flex-wrap gap-3">
        <SubmitButton label={submitLabel} isLoading={isSubmitting} />
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function addressToFormValues(address: Address): AddressFormValues {
  return {
    fullName: address.fullName,
    phoneNumber: address.phoneNumber,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
  };
}
