import type { Sneaker } from "@/types/product";
import { SneakerCard } from "@/components/products/SneakerCard";

interface ProductGridProps {
  sneakers: Sneaker[];
}

export function ProductGrid({ sneakers }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sneakers.map((sneaker) => (
        <SneakerCard key={sneaker.id} sneaker={sneaker} />
      ))}
    </div>
  );
}
