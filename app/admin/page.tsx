import Link from "next/link";
import { getAdminStats, getAllOrders } from "@/lib/queries";
import { StatsCard } from "@/components/admin/StatsCard";
import { formatPrice, formatDate } from "@/lib/utils";
import { BRAND_NAME, ORDER_STATUS_LABELS } from "@/lib/constants";
import { ShoppingCart, Users, Package, IndianRupee, Plus, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboard() {
  const [stats, orders] = await Promise.all([getAdminStats(), getAllOrders()]);
  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-sm text-gray-500">Welcome to {BRAND_NAME} Admin</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 transition-colors hover:border-brand-800 hover:bg-brand-50"
        >
          <div className="rounded-full bg-brand-900 p-3 text-white">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">Add Product</p>
            <p className="text-sm text-gray-500">Upload photos, set price & stock</p>
          </div>
        </Link>
        <Link
          href="/admin/categories"
          className="flex items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 transition-colors hover:border-brand-800 hover:bg-brand-50"
        >
          <div className="rounded-full bg-brand-100 p-3 text-brand-900">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">Manage Categories</p>
            <p className="text-sm text-gray-500">Women, Men, Kids, Ethnic & more</p>
          </div>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} />
        <StatsCard title="Customers" value={stats.totalCustomers} icon={Users} />
        <StatsCard title="Products" value={stats.totalProducts} icon={Package} />
        <StatsCard title="Revenue" value={formatPrice(stats.totalRevenue)} icon={IndianRupee} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-800 hover:underline">
            View All
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order ID</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      {(order.profiles as { full_name?: string })?.full_name || order.address?.full_name || "Guest"}
                    </td>
                    <td className="px-4 py-3">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3"><Badge>{ORDER_STATUS_LABELS[order.status] || order.status}</Badge></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No orders yet — share your store link with customers!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {stats.totalProducts === 0 && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="font-medium text-amber-900">No products yet</p>
          <p className="mt-1 text-sm text-amber-800">
            Start by adding your first product with photos and prices.
          </p>
          <Link href="/admin/products/new">
            <Button className="mt-4">Add Your First Product</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
