"use client";

import type { Category } from "@/types/product";
import { SORT_OPTIONS } from "@/types/product";

export interface ProductFilterValues {
  search: string;
  brand: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

interface ProductFiltersProps {
  values: ProductFilterValues;
  categories: Category[];
  onChange: (values: ProductFilterValues) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-brand-500";

const labelClass = "mb-1.5 block text-xs font-medium text-gray-600 dark:text-zinc-400";

export function ProductFilters({
  values,
  categories,
  onChange,
  onSubmit,
  onReset,
}: ProductFiltersProps) {
  const update = (patch: Partial<ProductFilterValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="sm:col-span-2 lg:col-span-2">
          <label htmlFor="search" className={labelClass}>
            Search
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search sneakers..."
            value={values.search}
            onChange={(e) => update({ search: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="brand" className={labelClass}>
            Brand
          </label>
          <input
            id="brand"
            type="text"
            placeholder="e.g. Nike"
            value={values.brand}
            onChange={(e) => update({ brand: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            value={values.categoryId}
            onChange={(e) => update({ categoryId: e.target.value })}
            className={inputClass}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="minPrice" className={labelClass}>
            Min price
          </label>
          <input
            id="minPrice"
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            value={values.minPrice}
            onChange={(e) => update({ minPrice: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="maxPrice" className={labelClass}>
            Max price
          </label>
          <input
            id="maxPrice"
            type="number"
            min={0}
            step="0.01"
            placeholder="500"
            value={values.maxPrice}
            onChange={(e) => update({ maxPrice: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="sort" className={labelClass}>
            Sort by
          </label>
          <select
            id="sort"
            value={values.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className={inputClass}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
