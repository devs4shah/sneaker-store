"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useWishlistStore } from "@/store/wishlistStore";

interface WishlistToggleButtonProps {
  sneakerId: string;
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function WishlistToggleButton({
  sneakerId,
  className = "",
  size = "md",
  showLabel = false,
}: WishlistToggleButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => Boolean(s.accessToken));
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(sneakerId));
  const isMutating = useWishlistStore((s) => s.isMutating);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const [localError, setLocalError] = useState<string | null>(null);

  const iconSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const heartSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isAdmin) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLocalError(null);
    try {
      await toggleWishlist(sneakerId);
    } catch {
      setLocalError("Could not update wishlist");
    }
  };

  if (isAdmin) {
    return null;
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={(event) => void handleClick(event)}
        disabled={isMutating}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isInWishlist}
        title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        className={`inline-flex items-center justify-center gap-2 rounded-full border bg-white/95 shadow-sm backdrop-blur transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-900/95 ${
          showLabel ? "h-10 px-3" : iconSize
        } ${
          isInWishlist
            ? "border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
            : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-red-900/50 dark:hover:text-red-400"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={isInWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          className={heartSize}
          aria-hidden
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        {showLabel ? (
          <span className="pr-2 text-sm font-medium">
            {isInWishlist ? "Saved" : "Save"}
          </span>
        ) : null}
      </button>
      {localError ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{localError}</p> : null}
    </div>
  );
}
