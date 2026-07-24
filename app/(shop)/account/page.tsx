import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders, getProfile, getWishlist } from "@/lib/queries";
import { OrderCard } from "@/components/account/OrderCard";
import { Order } from "@/lib/types";
import { Package, Heart, User, ShoppingBag } from "lucide-react";

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
  const name = profile?.full_name || profile?.username || "there";

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-6 text-white shadow-lg">
        <p className="text-sm text-white/80">Welcome back</p>
        <p className="mt-1 text-2xl font-bold">Hello, {name}!</p>
        <p className="mt-2 text-sm text-white/75">
          Manage orders, wishlist, and profile from your account dashboard.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/account/orders", icon: Package, value: orders.length, label: "Total Orders" },
          { href: "/wishlist", icon: Heart, value: wishlist.length, label: "Wishlist Items" },
          { href: "/account/profile", icon: User, value: null, label: "Edit Profile" },
        ].map(({ href, icon: Icon, value, label }) => (
          <Link
            key={href}
            href={href}
            className="card group transition hover:border-brand-200 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-800 transition group-hover:bg-brand-100">
              <Icon className="h-5 w-5" />
            </div>
            {value !== null && (
              <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
            )}
            <p className={`${value !== null ? "mt-0.5" : "mt-3"} text-sm text-gray-500`}>{label}</p>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          {orders.length > 0 && (
            <Link href="/account/orders" className="text-sm font-medium text-brand-800 hover:underline">
              View all
            </Link>
          )}
        </div>
        {recentOrders.length > 0 ? (
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} compact />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-gray-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
