"use client";

import { useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { OrderCard } from "@/components/account/OrderCard";
import { Order } from "@/lib/types";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_SHORT_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AccountOrdersClientProps {
  orders: Order[];
}

export function AccountOrdersClient({ orders }: AccountOrdersClientProps) {
  const [filter, setFilter] = useState("");

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  const statusCounts = ORDER_STATUSES.reduce(
    (acc, status) => {
      acc[status] = orders.filter((o) => o.status === status).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <>
      {orders.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-sm",
              !filter ? "bg-brand-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            All ({orders.length})
          </button>
          {ORDER_STATUSES.map((status) => {
            const count = statusCounts[status] || 0;
            if (count === 0) return null;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-sm",
                  filter === status
                    ? "bg-brand-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {ORDER_STATUS_SHORT_LABELS[status] || ORDER_STATUS_LABELS[status]} ({count})
              </button>
            );
          })}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="mt-5 space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 py-14 text-center">
          <p className="font-medium text-gray-700">
            No orders with status &quot;{ORDER_STATUS_LABELS[filter] || filter}&quot;
          </p>
          <button
            type="button"
            onClick={() => setFilter("")}
            className="mt-3 text-sm text-brand-800 hover:underline"
          >
            Show all orders
          </button>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 py-14 text-center">
          <Package className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-medium text-gray-700">No orders yet</p>
          <p className="mt-1 text-sm text-gray-500">Start shopping to see your orders here</p>
          <Link
            href="/shop"
            className="mt-4 inline-block rounded-lg bg-brand-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-800"
          >
            Browse Products
          </Link>
        </div>
      )}
    </>
  );
}
