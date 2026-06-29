import Link from "next/link";
import { WishlistToggleButton } from "@/components/products/WishlistToggleButton";
import { getPrimarySneakerImage } from "@/lib/sneakerImages";
import { formatPrice } from "@/lib/format";
import type { Sneaker } from "@/types/product";
import { SneakerImage } from "@/components/products/SneakerImage";
import { StockBadge } from "@/components/products/StockBadge";

interface SneakerCardProps {
  sneaker: Sneaker;
}

export function SneakerCard({ sneaker }: SneakerCardProps) {
  const primaryImage = getPrimarySneakerImage(sneaker.images)?.imageUrl;

  return (
    <Link
      href={`/sneakers/${sneaker.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-500/50"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <SneakerImage
          src={primaryImage}
          alt={sneaker.name}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3 z-10">
          <WishlistToggleButton sneakerId={sneaker.id} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
              {sneaker.brand}
            </p>
            <h3 className="mt-0.5 truncate text-base font-semibold text-gray-900 dark:text-zinc-100">
              {sneaker.name}
            </h3>
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
  );
}
