"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/forms/FormField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validations/checkout";

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => Promise<void>;
  serverError: string | null;
}

export function CheckoutForm({ onSubmit, serverError }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Shipping address</h2>
      <Alert variant="error" message={serverError ?? ""} />

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

      <SubmitButton label="Place order" isLoading={isSubmitting} />
    </form>
  );
}
