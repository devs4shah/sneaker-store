"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ProductFilters,
  type ProductFilterValues,
} from "@/components/products/ProductFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/products/ProductGridSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDebounce } from "@/hooks/useDebounce";
import { getApiErrorMessage } from "@/lib/apiClient";
import { productService } from "@/services/productService";
import type { Category, PageResponse, Sneaker } from "@/types/product";

const DEFAULT_FILTERS: ProductFilterValues = {
  search: "",
  brand: "",
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  sort: "createdAt,desc",
};

function filtersFromParams(params: URLSearchParams): ProductFilterValues {
  return {
    search: params.get("search") ?? "",
    brand: params.get("brand") ?? "",
    categoryId: params.get("categoryId") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    sort: params.get("sort") ?? "createdAt,desc",
  };
}

function paramsFromFilters(filters: ProductFilterValues, page: number) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.sort) params.set("sort", filters.sort);
  if (page > 0) params.set("page", String(page));
  return params;
}

function toApiFilters(filters: ProductFilterValues, page: number) {
  return {
    search: filters.search || undefined,
    brand: filters.brand || undefined,
    categoryId: filters.categoryId || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    sort: filters.sort,
    page,
    size: 12,
  };
}

export function SneakersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ProductFilterValues>(() =>
    filtersFromParams(searchParams),
  );
  const [page, setPage] = useState(() => Number(searchParams.get("page") ?? "0"));
  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<PageResponse<Sneaker> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(filters.search);

  const queryFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const syncUrl = useCallback(
    (nextFilters: ProductFilterValues, nextPage: number) => {
      const params = paramsFromFilters(nextFilters, nextPage);
      router.replace(params.toString() ? `/sneakers?${params}` : "/sneakers");
    },
    [router],
  );

  const fetchSneakers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await productService.getSneakers(toApiFilters(queryFilters, page));
      setResult(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load sneakers"));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [queryFilters, page]);

  useEffect(() => {
    productService
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    void fetchSneakers();
  }, [fetchSneakers]);

  const applyFilters = () => {
    setPage(0);
    syncUrl(filters, 0);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
    router.replace("/sneakers");
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    syncUrl(queryFilters, nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
          Shop Sneakers
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">
          Discover premium kicks from top brands. Filter by brand, category, and price.
        </p>
      </div>

      <ProductFilters
        values={filters}
        categories={categories}
        onChange={setFilters}
        onSubmit={applyFilters}
        onReset={resetFilters}
      />

      {isLoading ? (
        <ProductGridSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void fetchSneakers()} />
      ) : !result || result.content.length === 0 ? (
        <EmptyState
          title="No sneakers found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Showing {result.content.length} of {result.totalElements} sneakers
          </p>
          <ProductGrid sneakers={result.content} />
          {result.totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => goToPage(page - 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-zinc-400">
                Page {page + 1} of {result.totalPages}
              </span>
              <button
                type="button"
                disabled={result.last}
                onClick={() => goToPage(page + 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
