type StatusKind = "order" | "payment";

interface OrderStatusBadgeProps {
  kind: StatusKind;
  status: string;
  className?: string;
}

const orderStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  SHIPPED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300",
  DELIVERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  CANCELLED: "bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const paymentStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
  REFUNDED: "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
};

function formatLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function OrderStatusBadge({ kind, status, className = "" }: OrderStatusBadgeProps) {
  const normalized = status.toUpperCase();
  const styles =
    kind === "payment" ? paymentStatusStyles[normalized] : orderStatusStyles[normalized];
  const toneClass =
    styles ?? "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClass} ${className}`}
    >
      {formatLabel(normalized)}
    </span>
  );
}
