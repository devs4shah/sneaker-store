export function formatPrice(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
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
