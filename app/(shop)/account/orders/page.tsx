import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/shop/ProductImage";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { Order, OrderItem } from "@/lib/types";

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/orders");

  const orders = (await getUserOrders(user.id)) as Order[];

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
      <p className="mt-1 text-sm text-gray-500">Track delivery status and view past purchases</p>

      {orders.length > 0 ? (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const items = (order.order_items || []) as OrderItem[];
            return (
              <div key={order.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <Badge variant={order.status === "delivered" ? "success" : "default"}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      {item.image_url && (
                        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                          <ProductImage
                            src={item.image_url}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <span className="text-gray-600">
                        {item.product_name} x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                  <Link href={`/account/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 text-gray-500">No orders yet.</p>
      )}
    </div>
  );
}
