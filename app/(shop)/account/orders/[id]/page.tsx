import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/queries";
import { formatPrice, formatDate, maskPhone } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ProductImage } from "@/components/shop/ProductImage";
import { OrderTrackingTimeline } from "@/components/shop/OrderTrackingTimeline";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { OrderItem, OrderStatus } from "@/lib/types";
import { ArrowLeft, MapPin, CreditCard } from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");

  const order = await getOrderById(id);
  if (!order) notFound();

  if (order.user_id && order.user_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") notFound();
  }

  const items = (order.order_items || []) as OrderItem[];

  return (
    <div className="space-y-5">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-800 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="card overflow-hidden p-0">
        <div className="bg-gradient-to-r from-brand-900 to-brand-800 px-5 py-6 text-white sm:px-6">
          <p className="text-sm text-white/70">Order Details</p>
          <h2 className="mt-1 text-2xl font-bold">#{id.slice(0, 8).toUpperCase()}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Badge
              variant={order.status === "delivered" ? "success" : order.status === "pending" ? "warning" : "default"}
              className="bg-white/20 text-white"
            >
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </Badge>
            <span className="text-sm text-white/80">{formatDate(order.created_at)}</span>
            <span className="text-lg font-bold">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <OrderTrackingTimeline
            status={order.status as OrderStatus}
            createdAt={order.created_at}
            trackingNumber={order.tracking_number}
            estimatedDelivery={order.estimated_delivery}
          />
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-900">Items Ordered</h3>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-3"
            >
              <div className="flex items-center gap-3">
                {item.image_url ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-white ring-1 ring-gray-100">
                    <ProductImage src={item.image_url} alt={item.product_name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white text-xs text-gray-400">
                    No img
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{item.product_name}</p>
                  <p className="text-sm text-gray-500">
                    {item.size}, {item.color} · Qty {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-lg font-bold">
          <span>Total (COD)</span>
          <span className="text-brand-900">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-800" />
            <h3 className="font-bold text-gray-900">Delivery Address</h3>
          </div>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p className="font-medium text-gray-900">{order.address.full_name}</p>
            <p>{order.address.address_line1}</p>
            {order.address.address_line2 && <p>{order.address.address_line2}</p>}
            <p>
              {order.address.city}, {order.address.state} - {order.address.pincode}
            </p>
            <p>Contact: {maskPhone(order.address.phone)}</p>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand-800" />
            <h3 className="font-bold text-gray-900">Payment</h3>
          </div>
          <p className="mt-3 text-sm text-gray-600">Cash on Delivery</p>
          <p className="mt-1 text-sm text-gray-500">Pay when your order arrives at your doorstep.</p>
        </div>
      </div>
    </div>
  );
}
