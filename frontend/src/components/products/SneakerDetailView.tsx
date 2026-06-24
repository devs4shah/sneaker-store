"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ImageGallery } from "@/components/products/ImageGallery";
import { ProductReviewsSection } from "@/components/products/ProductReviewsSection";
import { WishlistToggleButton } from "@/components/products/WishlistToggleButton";
import { StockBadge } from "@/components/products/StockBadge";
import { ErrorState } from "@/components/ui/ErrorState";
import { Alert } from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/lib/apiClient";
import { formatPrice } from "@/lib/format";
import { productService } from "@/services/productService";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import type { Sneaker } from "@/types/product";

interface SneakerDetailViewProps {
  sneakerId: string;
}

export function SneakerDetailView({ sneakerId }: SneakerDetailViewProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => Boolean(s.accessToken));
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const addItem = useCartStore((s) => s.addItem);

  const [sneaker, setSneaker] = useState<Sneaker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  const fetchSneaker = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await productService.getSneakerById(sneakerId);
      setSneaker(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load sneaker details"));
      setSneaker(null);
    } finally {
      setIsLoading(false);
    }
  }, [sneakerId]);

  useEffect(() => {
    void fetchSneaker();
  }, [fetchSneaker]);

  const handleAddToCart = async () => {
    if (!sneaker || isAdmin) return;

    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/sneakers/${sneaker.id}`)}`);
      return;
    }

    if (sneaker.stockQuantity <= 0) return;

    setIsAdding(true);
    setCartMessage(null);
    setCartError(null);

    try {
      await addItem(sneaker.id, quantity);
      setCartMessage(`Added ${quantity} item(s) to your cart.`);
    } catch (err) {
      setCartError(getApiErrorMessage(err, "Could not add to cart"));
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-gray-200 dark:bg-zinc-800" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="h-24 w-full animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="h-12 w-full animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (error || !sneaker) {
    return (
      <ErrorState
        title="Product not found"
        message={error ?? "This sneaker could not be loaded."}
        onRetry={() => void fetchSneaker()}
      />
    );
  }

  const outOfStock = sneaker.stockQuantity <= 0;
  const lowStock = sneaker.stockQuantity > 0 && sneaker.stockQuantity <= 5;
  const maxQuantity = Math.max(1, sneaker.stockQuantity);

  return (
    <div className="space-y-6">
      <Link
        href="/sneakers"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <ImageGallery images={sneaker.images} productName={sneaker.name} />

        <div className="flex flex-col">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {sneaker.brand}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-zinc-100">{sneaker.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
              {formatPrice(sneaker.price)}
            </p>
            <StockBadge stockQuantity={sneaker.stockQuantity} />
            {!isAdmin ? (
              <WishlistToggleButton sneakerId={sneaker.id} showLabel size="md" />
            ) : null}
          </div>

          {lowStock ? (
            <div className="mt-4">
              <Alert
                variant="warning"
                message={`Hurry — only ${sneaker.stockQuantity} pair${sneaker.stockQuantity === 1 ? "" : "s"} left in stock.`}
              />
            </div>
          ) : null}

          {outOfStock ? (
            <div className="mt-4">
              <Alert variant="error" message="This sneaker is currently out of stock." />
            </div>
          ) : null}

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-gray-500 dark:text-zinc-400">Category</dt>
              <dd className="font-medium text-gray-900 dark:text-zinc-100">{sneaker.category.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-zinc-400">Size</dt>
              <dd className="font-medium text-gray-900 dark:text-zinc-100">{sneaker.size}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-zinc-400">Color</dt>
              <dd className="font-medium text-gray-900 dark:text-zinc-100">{sneaker.color}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-zinc-400">Gender</dt>
              <dd className="font-medium text-gray-900 dark:text-zinc-100">{sneaker.gender}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-zinc-400">Available</dt>
              <dd className="font-medium text-gray-900 dark:text-zinc-100">
                {sneaker.stockQuantity} units
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Description</h2>
            <p className="mt-2 leading-relaxed text-gray-600 dark:text-zinc-400">
              {sneaker.description || "No description available for this sneaker."}
            </p>
          </div>

          <div className="mt-8 space-y-4 border-t border-gray-200 pt-8 dark:border-zinc-800">
            {isAdmin ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                Administrator accounts cannot place orders or use the cart.
              </p>
            ) : (
              <>
                {cartMessage ? <Alert variant="success" message={cartMessage} /> : null}
                {cartError ? <Alert variant="error" message={cartError} /> : null}

                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label
                      htmlFor="quantity"
                      className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300"
                    >
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min={1}
                      max={maxQuantity}
                      value={quantity}
                      disabled={outOfStock}
                      onChange={(e) =>
                        setQuantity(Math.min(maxQuantity, Math.max(1, Number(e.target.value) || 1)))
                      }
                      className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleAddToCart()}
                    disabled={outOfStock || isAdding}
                    className="flex-1 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-600 sm:flex-none sm:min-w-[200px]"
                  >
                    {outOfStock
                      ? "Out of stock"
                      : isAdding
                        ? "Adding..."
                        : isAuthenticated
                          ? "Add to cart"
                          : "Sign in to add to cart"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ProductReviewsSection sneakerId={sneakerId} />
    </div>
  );
}
