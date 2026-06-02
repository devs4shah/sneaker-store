import { SneakerImage } from "@/components/products/SneakerImage";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-gray-100 px-4 py-4 sm:px-6 dark:border-zinc-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
              Order ID
            </p>
            <p className="truncate font-mono text-sm font-semibold text-gray-900 dark:text-zinc-100">
              {order.orderNumber}
            </p>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {formatDateTime(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge kind="payment" status={order.paymentStatus} />
            <OrderStatusBadge kind="order" status={order.orderStatus} />
          </div>
        </div>

        <p className="mt-4 text-lg font-bold text-gray-900 dark:text-zinc-100">
          Total: {formatPrice(order.totalAmount)}
        </p>
      </div>

      <div className="px-4 py-4 sm:px-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Items purchased</h3>
        <ul className="mt-3 divide-y divide-gray-100 dark:divide-zinc-800">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
                <SneakerImage src={item.imageUrl} alt={item.sneakerName} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-zinc-100">{item.sneakerName}</p>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
                  Qty {item.quantity} · {formatPrice(item.sneakerPrice)} each
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-gray-900 dark:text-zinc-100">
                {formatPrice(item.lineSubtotal)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
