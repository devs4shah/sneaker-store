import { z } from "zod";

const genderEnum = z.enum(["MEN", "WOMEN", "UNISEX", "KIDS"]);

export const sneakerFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  brand: z.string().min(1, "Brand is required").max(100, "Brand is too long"),
  description: z.string().max(5000, "Description is too long").optional().or(z.literal("")),
  price: z.coerce.number().positive("Price must be greater than zero"),
  stockQuantity: z.coerce.number().int().min(0, "Stock cannot be negative"),
  gender: genderEnum,
  color: z.string().min(1, "Color is required").max(50, "Color is too long"),
  size: z.coerce.number().positive("Size must be greater than zero"),
  categoryId: z.string().min(1, "Category is required"),
});

export type SneakerFormValues = z.infer<typeof sneakerFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name is too long"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
