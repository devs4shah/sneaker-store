import { getStockLabel, getStockTone } from "@/lib/format";

interface StockBadgeProps {
  stockQuantity: number;
  className?: string;
}

const toneStyles = {
  out: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  low: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  in: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
};

export function StockBadge({ stockQuantity, className = "" }: StockBadgeProps) {
  const tone = getStockTone(stockQuantity);

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${toneStyles[tone]} ${className}`}
    >
      {getStockLabel(stockQuantity)}
    </span>
  );
}
