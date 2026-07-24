"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { ProductImage } from "@/components/shop/ProductImage";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface AdminOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  tracking_number?: string | null;
  estimated_delivery?: string | null;
  address: { full_name: string; phone: string; city: string };
  order_items?: Array<{
    product_name: string;
    quantity: number;
    price: number;
    image_url?: string | null;
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

  const getTrackingEdit = (order: AdminOrder) =>
    trackingEdits[order.id] ?? {
      tracking_number: order.tracking_number || "",
      estimated_delivery: order.estimated_delivery?.slice(0, 10) || "",
    };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setError("");
    const tracking = trackingEdits[orderId];
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
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              tracking_number: tracking?.tracking_number || o.tracking_number,
              estimated_delivery: tracking?.estimated_delivery || o.estimated_delivery,
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
                            <ProductImage
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

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => saveTracking(order.id)}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                  >
                    Save Tracking
                  </button>
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
            );
          })
        ) : (
          <div className="rounded-lg border bg-white py-12 text-center text-gray-500">
            <p>No orders found.</p>
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
