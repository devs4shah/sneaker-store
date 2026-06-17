import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number({ required_error: "Rating is required" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .max(2000, "Comment must be at most 2000 characters")
    .optional()
    .or(z.literal("")),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
