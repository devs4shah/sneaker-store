import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(150, "Full name is too long"),
  phoneNumber: z.string().min(1, "Phone number is required").max(20, "Phone number is too long"),
  addressLine1: z.string().min(1, "Address line 1 is required").max(255, "Address is too long"),
  addressLine2: z.string().max(255, "Address line 2 is too long").optional().or(z.literal("")),
  city: z.string().min(1, "City is required").max(100, "City is too long"),
  state: z.string().min(1, "State is required").max(100, "State is too long"),
  postalCode: z.string().min(1, "Postal code is required").max(20, "Postal code is too long"),
  country: z.string().min(1, "Country is required").max(100, "Country is too long"),
  isDefault: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
