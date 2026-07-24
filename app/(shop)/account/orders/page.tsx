import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/queries";
import { OrderCard } from "@/components/account/OrderCard";
import { Order } from "@/lib/types";
import { Package } from "lucide-react";

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/orders");

  const orders = (await getUserOrders(user.id)) as Order[];

  return (
    <div className="card">
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-xl font-bold text-gray-900">Order History</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tap any order to track delivery and view details
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="mt-5 space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
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
    </div>
  );
}
