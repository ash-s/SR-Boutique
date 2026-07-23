"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  Star,
  ArrowLeft,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <>
      <div className="border-b p-4">
        <Link href="/admin" className="text-lg font-bold text-brand-900" onClick={() => setMobileOpen(false)}>
          {BRAND_NAME}
        </Link>
        <p className="text-xs text-gray-500">Admin Panel</p>
        <Link href="/admin/products/new" onClick={() => setMobileOpen(false)}>
          <Button size="sm" className="mt-3 w-full gap-1">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
        <Link href="/admin/categories" onClick={() => setMobileOpen(false)}>
          <Button size="sm" variant="outline" className="mt-2 w-full gap-1">
            <FolderOpen className="h-4 w-4" /> Add Category
          </Button>
        </Link>
      </div>
      <nav className="p-4">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : (pathname ?? "").startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-100 text-brand-900"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="mt-6 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>
      </nav>
    </>
  );

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-semibold">Admin</span>
        <Link href="/admin/products/new">
          <Plus className="h-6 w-6" />
        </Link>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl">
            <button
              className="absolute right-3 top-3 p-2"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}

      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:block">
        {nav}
      </aside>
    </>
  );
}
