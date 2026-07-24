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
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <Link href="/account/orders" className="text-sm text-brand-800 hover:underline">
        ← Back to Orders
      </Link>
      <h2 className="mt-4 text-xl font-bold">Order #{id.slice(0, 8).toUpperCase()}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Badge variant={order.status === "delivered" ? "success" : "default"}>
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </Badge>
        <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
      </div>

      <div className="mt-6">
        <OrderTrackingTimeline
          status={order.status as OrderStatus}
          createdAt={order.created_at}
          trackingNumber={order.tracking_number}
          estimatedDelivery={order.estimated_delivery}
        />
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Items</h3>
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-3">
                {item.image_url ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                    <ProductImage src={item.image_url} alt={item.product_name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                    No img
                  </div>
                )}
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-gray-500">
                    {item.size}, {item.color} · Qty {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t pt-4 font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <h3 className="font-semibold">Delivery Address</h3>
        <div className="mt-3 text-sm text-gray-600">
          <p>{order.address.full_name}</p>
          <p>{order.address.address_line1}</p>
          {order.address.address_line2 && <p>{order.address.address_line2}</p>}
          <p>
            {order.address.city}, {order.address.state} - {order.address.pincode}
          </p>
          <p>Contact: {maskPhone(order.address.phone)}</p>
        </div>
        <p className="mt-3 text-sm">Payment: Cash on Delivery</p>
      </div>
    </div>
  );
}
