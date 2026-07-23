"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderStatus } from "@/lib/types";

interface AdminOrdersClientProps {
  orders: Array<{
    id: string;
    status: string;
    total: number;
    created_at: string;
    address: { full_name: string; phone: string; city: string };
    profiles?: { full_name?: string; phone?: string } | null;
    order_items?: Array<{
      product_name: string;
      quantity: number;
      price: number;
      image_url?: string | null;
    }>;
  }>;
}

export function AdminOrdersClient({ orders: initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setError("");
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} total orders</p>
        </div>
        <Select
          options={[
            { value: "", label: "All Statuses" },
            ...ORDER_STATUSES.map((s) => ({
              value: s,
              label: ORDER_STATUS_LABELS[s] || s,
            })),
          ]}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-36 text-xs [&_select]:h-8 [&_select]:py-1"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 space-y-4">
        {filtered.length > 0 ? (
          filtered.map((order) => (
            <div key={order.id} className="rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Customer:</span>{" "}
                    {order.profiles?.full_name || order.address.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {order.profiles?.phone || order.address.phone} | {order.address.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatPrice(order.total)}</p>
                  <Badge className="mt-1">
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 border-t pt-3">
                <p className="text-sm font-medium">Items:</p>
                <div className="mt-2 space-y-2">
                  {order.order_items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {item.image_url && (
                        <div className="relative h-10 w-10 overflow-hidden rounded bg-gray-100">
                          <Image
                            src={item.image_url}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span className="text-gray-600">
                        {item.product_name} x{item.quantity} —{" "}
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm">Update delivery status:</span>
                <Select
                  options={ORDER_STATUSES.map((s) => ({
                    value: s,
                    label: ORDER_STATUS_LABELS[s] || s,
                  }))}
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  className="w-28 max-w-[7rem] text-xs [&_select]:h-8 [&_select]:py-1 [&_select]:text-xs"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border bg-white py-12 text-center text-gray-500">
            <p>No orders found.</p>
            <p className="mt-2 text-sm">
              If customers placed orders but nothing appears, ensure you ran migration 006/007 and
              your account has admin role.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
