"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { ProductImage } from "@/components/shop/ProductImage";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_ITEM_STATUSES, ORDER_ITEM_STATUS_LABELS, PAYMENT_STATUS_LABELS, ORDER_STATUS_SHORT_LABELS } from "@/lib/constants";
import { OrderStatus, OrderItemStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import { cn } from "@/lib/utils";

interface AdminOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  payment_method?: string;
  payment_status?: string;
  tracking_number?: string | null;
  estimated_delivery?: string | null;
  address: { full_name: string; phone: string; city: string };
  order_items?: Array<{
    id?: string;
    product_name: string;
    quantity: number;
    price: number;
    image_url?: string | null;
    item_status?: string;
  }>;
}

interface AdminOrdersClientProps {
  orders: AdminOrder[];
}

export function AdminOrdersClient({ orders: initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [trackingEdits, setTrackingEdits] = useState<
    Record<string, { tracking_number: string; estimated_delivery: string }>
  >({});
  const supabase = createClient();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load orders");
        return;
      }

      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch {
      setError("Could not connect to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = filter ? orders.filter((o) => o.status === filter) : orders;

  const statusCounts = ORDER_STATUSES.reduce(
    (acc, status) => {
      acc[status] = orders.filter((o) => o.status === status).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const getTrackingEdit = (order: AdminOrder) =>
    trackingEdits[order.id] ?? {
      tracking_number: order.tracking_number || "",
      estimated_delivery: order.estimated_delivery?.slice(0, 10) || "",
    };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setError("");
    const tracking = trackingEdits[orderId];

    if (status === "cancelled") {
      const { error: cancelError } = await supabase.rpc("cancel_order_with_stock", {
        p_order_id: orderId,
      });

      if (cancelError) {
        const { error: updateError } = await supabase
          .from("orders")
          .update({ status: "cancelled", payment_status: "refunded" })
          .eq("id", orderId);

        if (updateError) {
          setError(cancelError.message || updateError.message);
          return;
        }
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status,
                payment_status: "refunded",
                order_items: o.order_items?.map((item) => ({
                  ...item,
                  item_status: item.item_status === "active" ? "cancelled" : item.item_status,
                })),
              }
            : o
        )
      );
      return;
    }

    const payload: Record<string, string | null> = { status };
    if (tracking?.tracking_number) payload.tracking_number = tracking.tracking_number;
    if (tracking?.estimated_delivery) payload.estimated_delivery = tracking.estimated_delivery;

    const { error: updateError } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", orderId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (status === "delivered") {
      await supabase.rpc("record_order_payment", {
        p_order_id: orderId,
        p_payment_status: "paid",
        p_notes: "COD collected on delivery",
      });
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              payment_status: status === "delivered" ? "paid" : o.payment_status,
              tracking_number: tracking?.tracking_number || o.tracking_number,
              estimated_delivery: tracking?.estimated_delivery || o.estimated_delivery,
            }
          : o
      )
    );
  };

  const updateItemStatus = async (itemId: string, orderId: string, itemStatus: OrderItemStatus) => {
    setError("");
    const { error: rpcError } = await supabase.rpc("update_order_item_status", {
      p_item_id: itemId,
      p_new_status: itemStatus,
    });

    if (rpcError) {
      const { error: updateError } = await supabase
        .from("order_items")
        .update({ item_status: itemStatus })
        .eq("id", itemId);

      if (updateError) {
        setError(rpcError.message || updateError.message);
        return;
      }
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              order_items: o.order_items?.map((item) =>
                item.id === itemId ? { ...item, item_status: itemStatus } : item
              ),
            }
          : o
      )
    );
  };

  const saveTracking = async (orderId: string) => {
    setError("");
    const tracking = getTrackingEdit(orders.find((o) => o.id === orderId)!);
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        tracking_number: tracking.tracking_number || null,
        estimated_delivery: tracking.estimated_delivery || null,
      })
      .eq("id", orderId);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              tracking_number: tracking.tracking_number || null,
              estimated_delivery: tracking.estimated_delivery || null,
            }
          : o
      )
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `${orders.length} total orders`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            !filter ? "bg-brand-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          All ({orders.length})
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === status
                ? "bg-brand-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {ORDER_STATUS_SHORT_LABELS[status] || ORDER_STATUS_LABELS[status]} (
            {statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-lg border bg-white py-12 text-center text-gray-500">
            Loading orders...
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((order) => {
            const tracking = getTrackingEdit(order);
            return (
              <div key={order.id} className="rounded-lg border bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    <p className="mt-1 text-sm">
                      <span className="font-medium">Customer:</span>{" "}
                      {order.address?.full_name || "Guest"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {order.address?.phone || "—"} | {order.address?.city || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatPrice(order.total)}</p>
                    <div className="mt-1 flex justify-end">
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {(order.payment_method || "cod").toUpperCase()} ·{" "}
                      {PAYMENT_STATUS_LABELS[order.payment_status || "pending"] || "Pending"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 border-t pt-3">
                  <p className="text-sm font-medium">Items:</p>
                  <div className="mt-2 space-y-2">
                    {order.order_items?.map((item, i) => (
                      <div key={item.id || i} className="flex flex-wrap items-center gap-3 text-sm">
                        {item.image_url && (
                          <div className="relative h-10 w-10 overflow-hidden rounded bg-gray-100">
                            <ProductImage
                              src={item.image_url}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="flex-1 text-gray-600">
                          {item.product_name} x{item.quantity} —{" "}
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.id && (
                          <Select
                            options={ORDER_ITEM_STATUSES.map((s) => ({
                              value: s,
                              label: ORDER_ITEM_STATUS_LABELS[s] || s,
                            }))}
                            value={item.item_status || "active"}
                            onChange={(e) =>
                              updateItemStatus(
                                item.id!,
                                order.id,
                                e.target.value as OrderItemStatus
                              )
                            }
                            className="w-32 text-xs [&_select]:h-8 [&_select]:py-1 [&_select]:text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2">
                  <Input
                    label="Tracking ID"
                    placeholder="e.g. SR123456789"
                    value={tracking.tracking_number}
                    onChange={(e) =>
                      setTrackingEdits((prev) => ({
                        ...prev,
                        [order.id]: { ...tracking, tracking_number: e.target.value },
                      }))
                    }
                  />
                  <Input
                    label="Estimated Delivery"
                    type="date"
                    value={tracking.estimated_delivery}
                    onChange={(e) =>
                      setTrackingEdits((prev) => ({
                        ...prev,
                        [order.id]: { ...tracking, estimated_delivery: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                  <button
                    type="button"
                    onClick={() => saveTracking(order.id)}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                  >
                    Save Tracking
                  </button>
                  <span className="text-sm font-medium text-gray-700">Order status:</span>
                  <Select
                    options={ORDER_STATUSES.map((s) => ({
                      value: s,
                      label: ORDER_STATUS_LABELS[s] || s,
                    }))}
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                    className="min-w-[11rem] text-xs [&_select]:h-9 [&_select]:py-1 [&_select]:text-xs"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border bg-white py-12 text-center text-gray-500">
            <p>
              {filter
                ? `No orders with status "${ORDER_STATUS_LABELS[filter] || filter}"`
                : "No orders found."}
            </p>
            <p className="mt-2 text-sm">
              Add <code className="rounded bg-gray-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> to
              .env.local and set your account role to admin in Supabase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
