"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ReviewCard } from "@/components/products/ReviewCard";
import { ReviewForm } from "@/components/products/ReviewForm";
import { StarRating } from "@/components/products/StarRating";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { getApiErrorMessage } from "@/lib/apiClient";
import type { ReviewFormValues } from "@/lib/validations/review";
import { reviewService } from "@/services/reviewService";
import { useAuthStore } from "@/store/authStore";
import type { Review, SneakerReviewsData } from "@/types/review";

const PAGE_SIZE = 5;

interface ProductReviewsSectionProps {
  sneakerId: string;
}

export function ProductReviewsSection({ sneakerId }: ProductReviewsSectionProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => Boolean(s.accessToken));
  const isAdmin = useAuthStore((s) => s.isAdmin());

  const [data, setData] = useState<SneakerReviewsData | null>(null);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"hidden" | "create" | "edit">("hidden");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await reviewService.getSneakerReviews(sneakerId, page, PAGE_SIZE);
      setData(result);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load reviews"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [page, sneakerId]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const ownReview = data?.userReview ?? null;

  useEffect(() => {
    if (ownReview) {
      setFormMode("hidden");
    }
  }, [ownReview]);

  const handleCreate = async (values: ReviewFormValues) => {
    setActionError(null);
    setActionSuccess(null);

    try {
      await reviewService.createReview({
        sneakerId,
        rating: values.rating,
        comment: values.comment?.trim() || undefined,
      });
      setActionSuccess("Your review was submitted.");
      setFormMode("hidden");
      setPage(0);
      await fetchReviews();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not submit review"));
    }
  };

  const handleUpdate = async (values: ReviewFormValues) => {
    if (!ownReview) return;

    setActionError(null);
    setActionSuccess(null);

    try {
      await reviewService.updateReview(ownReview.id, {
        rating: values.rating,
        comment: values.comment?.trim() || undefined,
      });
      setActionSuccess("Your review was updated.");
      setFormMode("hidden");
      await fetchReviews();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not update review"));
    }
  };

  const handleDelete = async (reviewId: string) => {
    setActionError(null);
    setActionSuccess(null);
    setDeletingId(reviewId);

    try {
      await reviewService.deleteReview(reviewId);
      setActionSuccess("Your review was deleted.");
      setFormMode("hidden");
      if (data && data.reviews.content.length === 1 && page > 0) {
        setPage((current) => current - 1);
      } else {
        await fetchReviews();
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Could not delete review"));
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateForm = () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/sneakers/${sneakerId}`)}`);
      return;
    }
    setFormMode("create");
    setActionError(null);
    setActionSuccess(null);
  };

  return (
    <section className="border-t border-gray-200 pt-10 dark:border-zinc-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Customer reviews</h2>
          {data ? (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StarRating rating={data.averageRating} size="md" />
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                <span className="font-semibold text-gray-900 dark:text-zinc-100">
                  {data.averageRating.toFixed(1)}
                </span>{" "}
                out of 5
                <span className="mx-2 text-gray-300 dark:text-zinc-600">·</span>
                {data.reviewCount} review{data.reviewCount === 1 ? "" : "s"}
              </p>
            </div>
          ) : null}
        </div>

        {isAuthenticated && !isAdmin && !ownReview && formMode === "hidden" ? (
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            Write a review
          </button>
        ) : null}
      </div>

      {!isAuthenticated ? (
        <p className="mt-4 text-sm text-gray-600 dark:text-zinc-400">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/sneakers/${sneakerId}`)}`}
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Sign in
          </Link>{" "}
          to leave a review after purchasing this sneaker.
        </p>
      ) : null}

      {actionSuccess ? <div className="mt-4"><Alert variant="success" message={actionSuccess} /></div> : null}
      {actionError ? <div className="mt-4"><Alert variant="error" message={actionError} /></div> : null}

      {formMode === "create" ? (
        <div className="mt-6">
          <ReviewForm submitLabel="Submit review" onSubmit={handleCreate} onCancel={() => setFormMode("hidden")} />
        </div>
      ) : null}

      {formMode === "edit" && ownReview ? (
        <div className="mt-6">
          <ReviewForm
            submitLabel="Save changes"
            initialValues={{
              rating: ownReview.rating,
              comment: ownReview.comment ?? "",
            }}
            onSubmit={handleUpdate}
            onCancel={() => setFormMode("hidden")}
          />
        </div>
      ) : null}

      <div className="mt-6">
        {isLoading ? <LoadingState message="Loading reviews..." /> : null}

        {!isLoading && error ? (
          <ErrorState title="Could not load reviews" message={error} onRetry={() => void fetchReviews()} />
        ) : null}

        {!isLoading && !error && data && data.reviews.content.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description="Be the first to share your experience with this sneaker."
          />
        ) : null}

        {!isLoading && !error && data && data.reviews.content.length > 0 ? (
          <div className="space-y-4">
            {data.reviews.content.map((review: Review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwnReview={user?.id === review.userId}
                onEdit={() => {
                  setFormMode("edit");
                  setActionError(null);
                  setActionSuccess(null);
                }}
                onDelete={() => void handleDelete(review.id)}
                isDeleting={deletingId === review.id}
              />
            ))}

            {data.reviews.totalPages > 1 ? (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-zinc-800 sm:flex-row">
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  Page {data.reviews.page + 1} of {data.reviews.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={data.reviews.last}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
