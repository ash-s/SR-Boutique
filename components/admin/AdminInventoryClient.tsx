"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  LOW_STOCK_THRESHOLD,
  ORDER_ITEM_STATUS_LABELS,
} from "@/lib/constants";
import { AlertTriangle, Package, RefreshCw } from "lucide-react";

interface InventoryProduct {
  id: string;
  name: string;
  stock: number;
  is_active: boolean;
  category?: { name: string } | null;
  subcategory?: { name: string } | null;
}

interface SpecialItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  item_status: string;
  size: string | null;
  color: string | null;
  orders?: {
    id: string;
    status: string;
    created_at: string;
    address?: { full_name?: string };
  } | null;
}

interface InventoryMovement {
  id: string;
  change_qty: number;
  reason: string;
  created_at: string;
  products?: { name: string } | null;
}

type Tab = "stock" | "returned" | "replaced" | "cancelled";

export function AdminInventoryClient() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [tab, setTab] = useState<Tab>("stock");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/inventory", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load inventory");
        return;
      }
      setProducts(data.products || []);
      setSpecialItems(data.specialItems || []);
      setMovements(data.movements || []);
    } catch {
      setError("Could not connect to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = Array.from(
    new Set(products.map((p) => p.category?.name).filter((name): name is string => Boolean(name)))
  );

  const filteredProducts = categoryFilter
    ? products.filter((p) => p.category?.name === categoryFilter)
    : products;

  const lowStock = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD && p.is_active);
  const outOfStock = products.filter((p) => p.stock <= 0);

  const tabItems = specialItems.filter((item) => {
    if (tab === "returned") return item.item_status === "returned";
    if (tab === "replaced") return item.item_status === "replaced";
    if (tab === "cancelled") return item.item_status === "cancelled";
    return false;
  });

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "stock", label: "Stock Overview", count: products.length },
    {
      id: "returned",
      label: "Returned",
      count: specialItems.filter((i) => i.item_status === "returned").length,
    },
    {
      id: "replaced",
      label: "Replaced",
      count: specialItems.filter((i) => i.item_status === "replaced").length,
    },
    {
      id: "cancelled",
      label: "Cancelled Items",
      count: specialItems.filter((i) => i.item_status === "cancelled").length,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500">
            Stock updates automatically when customers place orders
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <Link href="/admin/products/new">
            <Button size="sm">Add Product</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Package className="h-4 w-4" /> Total Products
          </div>
          <p className="mt-1 text-2xl font-bold">{products.length}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4" /> Low Stock (≤{LOW_STOCK_THRESHOLD})
          </div>
          <p className="mt-1 text-2xl font-bold text-amber-900">{lowStock.length}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4" /> Out of Stock
          </div>
          <p className="mt-1 text-2xl font-bold text-red-900">{outOfStock.length}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-brand-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 rounded-lg border bg-white py-12 text-center text-gray-500">
          Loading inventory...
        </div>
      ) : tab === "stock" ? (
        <>
          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter("")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  !categoryFilter ? "bg-brand-100 text-brand-900" : "bg-gray-100 text-gray-600"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-md px-3 py-1 text-xs font-medium ${
                    categoryFilter === cat
                      ? "bg-brand-100 text-brand-900"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Product</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Subcategory</th>
                  <th className="px-4 py-3 text-left font-medium">Stock</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">{product.category?.name || "—"}</td>
                      <td className="px-4 py-3">{product.subcategory?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            product.stock <= 0
                              ? "font-semibold text-red-600"
                              : product.stock <= LOW_STOCK_THRESHOLD
                                ? "font-semibold text-amber-600"
                                : ""
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {product.stock <= 0 ? (
                          <Badge variant="sale">Out of Stock</Badge>
                        ) : product.stock <= LOW_STOCK_THRESHOLD ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {movements.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Recent Stock Changes</h2>
              <div className="mt-3 overflow-x-auto rounded-lg border bg-white">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Product</th>
                      <th className="px-4 py-3 text-left font-medium">Change</th>
                      <th className="px-4 py-3 text-left font-medium">Reason</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m) => (
                      <tr key={m.id} className="border-b last:border-0">
                        <td className="px-4 py-3">{m.products?.name || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={m.change_qty < 0 ? "text-red-600" : "text-green-600"}>
                            {m.change_qty > 0 ? "+" : ""}
                            {m.change_qty}
                          </span>
                        </td>
                        <td className="px-4 py-3 capitalize">{m.reason}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(m.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">Qty</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {tabItems.length > 0 ? (
                tabItems.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">
                      #{item.orders?.id?.slice(0, 8).toUpperCase() || "—"}
                    </td>
                    <td className="px-4 py-3">{item.orders?.address?.full_name || "Guest"}</td>
                    <td className="px-4 py-3">
                      {item.product_name}
                      {item.size && (
                        <span className="text-gray-500">
                          {" "}
                          ({item.size}
                          {item.color ? ` / ${item.color}` : ""})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{formatPrice(item.price * item.quantity)}</td>
                    <td className="px-4 py-3">
                      <Badge>
                        {ORDER_ITEM_STATUS_LABELS[item.item_status] || item.item_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {item.orders?.created_at ? formatDate(item.orders.created_at) : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No {tab} items yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
