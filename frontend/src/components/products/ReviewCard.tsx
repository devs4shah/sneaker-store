import { formatDateTime } from "@/lib/format";
import type { Review } from "@/types/review";
import { StarRating } from "@/components/products/StarRating";

interface ReviewCardProps {
  review: Review;
  isOwnReview?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function ReviewCard({
  review,
  isOwnReview = false,
  onEdit,
  onDelete,
  isDeleting = false,
}: ReviewCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{review.reviewerName}</h3>
            {isOwnReview ? (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                Your review
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            <time
              className="text-xs text-gray-500 dark:text-zinc-400"
              dateTime={review.createdAt}
            >
              {formatDateTime(review.createdAt)}
            </time>
          </div>
        </div>

        {isOwnReview ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        ) : null}
      </div>

      {review.comment ? (
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-zinc-400">{review.comment}</p>
      ) : (
        <p className="mt-3 text-sm italic text-gray-400 dark:text-zinc-500">No written comment.</p>
      )}
    </article>
  );
}
