import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders, getProfile, getWishlist } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { Order } from "@/lib/types";
import { Package, Heart, User } from "lucide-react";

export default async function AccountOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");

  const [profile, orders, wishlist] = await Promise.all([
    getProfile(),
    getUserOrders(user.id),
    getWishlist(user.id),
  ]);

  const recentOrders = (orders as Order[]).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-lg font-semibold text-gray-900">
          Hello, {profile?.full_name || profile?.username || "there"}!
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back to SR Boutique. Use the menu to manage your account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/account/orders"
          className="rounded-xl border bg-white p-4 shadow-sm transition hover:border-brand-200"
        >
          <Package className="h-5 w-5 text-brand-800" />
          <p className="mt-2 font-semibold">{orders.length}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </Link>
        <Link
          href="/wishlist"
          className="rounded-xl border bg-white p-4 shadow-sm transition hover:border-brand-200"
        >
          <Heart className="h-5 w-5 text-brand-800" />
          <p className="mt-2 font-semibold">{wishlist.length}</p>
          <p className="text-sm text-gray-500">Wishlist Items</p>
        </Link>
        <Link
          href="/account/profile"
          className="rounded-xl border bg-white p-4 shadow-sm transition hover:border-brand-200"
        >
          <User className="h-5 w-5 text-brand-800" />
          <p className="mt-2 font-semibold">Profile</p>
          <p className="text-sm text-gray-500">Edit your details</p>
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-brand-800 hover:underline">
            View all
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <Badge>{ORDER_STATUS_LABELS[order.status] || order.status}</Badge>
                <span className="font-semibold">{formatPrice(order.total)}</span>
                <Link href={`/account/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
