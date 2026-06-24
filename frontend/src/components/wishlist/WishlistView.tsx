"use client";

import Link from "next/link";
import { useCallback, useEffect } from "react";
import { WishlistToggleButton } from "@/components/products/WishlistToggleButton";
import { SneakerImage } from "@/components/products/SneakerImage";
import { StockBadge } from "@/components/products/StockBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatPrice } from "@/lib/format";
import { useWishlistStore } from "@/store/wishlistStore";

export function WishlistView() {
  const items = useWishlistStore((s) => s.items);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const error = useWishlistStore((s) => s.error);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  const loadWishlist = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 sm:text-3xl">My Wishlist</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Sneakers you have saved for later.
        </p>
      </div>

      {isLoading ? <LoadingState message="Loading your wishlist..." /> : null}

      {!isLoading && error ? (
        <ErrorState title="Could not load wishlist" message={error} onRetry={() => void loadWishlist()} />
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Browse the shop and tap the heart icon to save sneakers you love."
          action={
            <Link
              href="/sneakers"
              className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              Browse sneakers
            </Link>
          }
        />
      ) : null}

      {!isLoading && !error && items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const sneaker = item.sneaker;
            const primaryImage = sneaker.images[0]?.imageUrl;

            return (
              <article
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="absolute right-3 top-3 z-10">
                  <WishlistToggleButton sneakerId={sneaker.id} size="sm" />
                </div>

                <Link href={`/sneakers/${sneaker.id}`} className="flex flex-1 flex-col">
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-zinc-800">
                    <SneakerImage
                      src={primaryImage}
                      alt={sneaker.name}
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2 pr-8">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
                          {sneaker.brand}
                        </p>
                        <h2 className="mt-0.5 line-clamp-2 text-base font-semibold text-gray-900 dark:text-zinc-100">
                          {sneaker.name}
                        </h2>
                      </div>
                      <StockBadge stockQuantity={sneaker.stockQuantity} />
                    </div>

                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                      {sneaker.category.name} · Size {sneaker.size}
                    </p>

                    <p className="mt-auto text-lg font-bold text-gray-900 dark:text-zinc-100">
                      {formatPrice(sneaker.price)}
                    </p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
