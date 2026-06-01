import { STORE_CURRENCY, STORE_LOCALE } from "@/lib/constants";

export function formatPrice(amount: number, currency = STORE_CURRENCY) {
  return new Intl.NumberFormat(STORE_LOCALE, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getStockLabel(stockQuantity: number) {
  if (stockQuantity <= 0) return "Out of stock";
  if (stockQuantity <= 5) return `Only ${stockQuantity} left`;
  return "In stock";
}

export function getStockTone(stockQuantity: number): "out" | "low" | "in" {
  if (stockQuantity <= 0) return "out";
  if (stockQuantity <= 5) return "low";
  return "in";
}
