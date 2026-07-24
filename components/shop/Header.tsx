"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  LogOut,
  Heart,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { BRAND_NAME } from "@/lib/constants";
import { MegaMenu } from "@/components/shop/MegaMenu";
import { MobileNavDrawer } from "@/components/shop/MobileNavDrawer";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { itemCount, isLoaded } = useCart();
  const { ids: wishlistIds, isLoaded: wishlistLoaded } = useWishlist();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        setUser(u);
        if (u) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", u.id)
            .maybeSingle();
          setIsAdmin(profile?.role === "admin");
        } else {
          setIsAdmin(false);
        }
      } catch {
        // Ignore auth/profile errors on public pages
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setIsAdmin(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      setIsAdmin(profile?.role === "admin");
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4">
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open categories menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <Link href="/" className="min-w-0 flex-shrink truncate">
              <span className="text-base font-semibold tracking-tight text-brand-900 sm:text-xl">
                {BRAND_NAME}
              </span>
            </Link>

            <MegaMenu />

            <div className="flex items-center gap-0.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              <Link
                href={user ? "/wishlist" : "/login?redirect=/wishlist"}
                className="relative rounded-full p-2 hover:bg-gray-100"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistLoaded && wishlistIds.size > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white sm:h-5 sm:w-5 sm:text-xs">
                    {wishlistIds.size > 9 ? "9+" : wishlistIds.size}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative rounded-full p-2 hover:bg-gray-100"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {isLoaded && itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-800 text-[10px] text-white sm:h-5 sm:w-5 sm:text-xs">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="group relative hidden sm:block">
                  <Link
                    href="/account"
                    className="rounded-full p-2 hover:bg-gray-100"
                    aria-label="Account"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                  <div className="invisible absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-white py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-50">
                      My Account
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden items-center gap-1 sm:flex sm:gap-2">
                  <Link
                    href="/login"
                    className="rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 sm:px-3 sm:text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-brand-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-brand-800 sm:px-3 sm:text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {user && (
                <Link href="/account" className="rounded-full p-2 hover:bg-gray-100 sm:hidden" aria-label="Account">
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
          />
          <div className="absolute left-1/2 top-[15%] w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Search Products</h2>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-full p-1.5 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="mt-3 w-full rounded-md bg-brand-900 py-2.5 text-sm font-medium text-white hover:bg-brand-800"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      <MobileNavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} user={user} />
    </>
  );
}
