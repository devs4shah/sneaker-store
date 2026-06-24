import { Suspense } from "react";
import { SneakersPage } from "@/components/products/SneakersPage";
import { ProductGridSkeleton } from "@/components/products/ProductGridSkeleton";

export default function ShopHomePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div className="h-20 animate-pulse rounded-2xl bg-gray-200 dark:bg-zinc-800" />
          <ProductGridSkeleton />
        </div>
      }
    >
      <SneakersPage />
    </Suspense>
  );
}
