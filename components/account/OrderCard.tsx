import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { ProductImage } from "@/components/shop/ProductImage";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { Order, OrderItem } from "@/lib/types";

interface OrderCardProps {
  order: Order;
  compact?: boolean;
}

export function OrderCard({ order, compact = false }: OrderCardProps) {
  const items = (order.order_items || []) as OrderItem[];
  const previewItems = compact ? items.slice(0, 1) : items.slice(0, 3);
  const extraCount = items.length - previewItems.length;

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="group block rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-brand-200 hover:shadow-md active:scale-[0.99] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="mt-0.5 text-sm text-gray-500">{formatDate(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <ChevronRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
        </div>
      </div>

      {!compact && previewItems.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-50 pt-4">
          {previewItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2.5">
              {item.image_url ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-100">
                  <ProductImage
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-[10px] text-gray-400">
                  No img
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800">{item.product_name}</p>
                <p className="text-xs text-gray-500">Qty {item.quantity}</p>
              </div>
            </div>
          ))}
          {extraCount > 0 && (
            <span className="self-center text-xs text-gray-500">+{extraCount} more</span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
        <span className="text-sm text-gray-500">
          {items.length} item{items.length !== 1 ? "s" : ""} · COD
        </span>
        <span className="text-lg font-bold text-brand-900">{formatPrice(order.total)}</span>
      </div>
    </Link>
  );
}
