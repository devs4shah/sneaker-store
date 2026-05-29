export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="aspect-square animate-pulse bg-gray-200 dark:bg-zinc-800" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
            <div className="h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
