interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

export function StarRating({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div
      className={`inline-flex items-center gap-0.5 ${sizeClasses[size]}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= Math.round(rating);

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange?.(starValue)}
              className={`transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded ${
                filled ? "text-amber-400" : "text-gray-300 dark:text-zinc-600"
              }`}
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            >
              ★
            </button>
          );
        }

        return (
          <span
            key={starValue}
            className={filled ? "text-amber-400" : "text-gray-300 dark:text-zinc-600"}
            aria-hidden
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
