import { z } from "zod";

export const checkoutSchema = z.object({
  shippingAddress: z.string().min(1, "Shipping address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
