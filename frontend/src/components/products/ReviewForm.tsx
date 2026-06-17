"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarRating } from "@/components/products/StarRating";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { reviewSchema, type ReviewFormValues } from "@/lib/validations/review";

interface ReviewFormProps {
  initialValues?: ReviewFormValues;
  submitLabel: string;
  onSubmit: (values: ReviewFormValues) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({ initialValues, submitLabel, onSubmit, onCancel }: ReviewFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: initialValues ?? { rating: 5, comment: "" },
  });

  const rating = watch("rating");

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
          Your rating
        </label>
        <StarRating
          rating={rating}
          interactive
          size="lg"
          onChange={(value) => setValue("rating", value, { shouldValidate: true })}
        />
        {errors.rating ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rating.message}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="comment"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300"
        >
          Comment (optional)
        </label>
        <textarea
          id="comment"
          rows={4}
          {...register("comment")}
          placeholder="Share your experience with this sneaker..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        {errors.comment ? (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.comment.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SubmitButton isLoading={isSubmitting} label={submitLabel} />
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-white dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
