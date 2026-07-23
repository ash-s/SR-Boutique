"use client";

import Link from "next/link";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { MAIN_CATEGORIES, SUBCATEGORIES } from "@/lib/constants";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  user: { id: string } | null;
}

export function MobileNavDrawer({ open, onClose, user }: MobileNavDrawerProps) {
  const [expanded, setExpanded] = useState<string | null>(MAIN_CATEGORIES[0]?.slug ?? null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close menu"
      />
      <aside className="absolute left-0 top-0 flex h-full w-[min(320px,85vw)] flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-4">
          <span className="text-lg font-semibold text-brand-900">Categories</span>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <Link
            href="/shop"
            onClick={onClose}
            className="mb-2 block rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-900 hover:bg-gray-50"
          >
            All Products
          </Link>

          {MAIN_CATEGORIES.map((cat) => {
            const isOpen = expanded === cat.slug;
            const subs = SUBCATEGORIES[cat.slug] || [];
            return (
              <div key={cat.slug} className="mb-1">
                <div className="flex items-center rounded-lg hover:bg-gray-50">
                  <Link
                    href={`/shop/${cat.slug}`}
                    onClick={onClose}
                    className="flex-1 px-3 py-2.5 text-sm font-medium text-gray-900"
                  >
                    {cat.name}
                  </Link>
                  {subs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : cat.slug)}
                      className="p-2 text-gray-500"
                      aria-label={`Toggle ${cat.name} subcategories`}
                    >
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                {isOpen && subs.length > 0 && (
                  <div className="ml-3 border-l pl-2">
                    {subs.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/shop/${cat.slug}?subcategory=${sub.slug}`}
                        onClick={onClose}
                        className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-800"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t px-4 py-4 space-y-2">
          {user ? (
            <>
              <Link href="/account" onClick={onClose} className="block text-sm font-medium text-gray-700">
                My Account
              </Link>
              <Link href="/wishlist" onClick={onClose} className="block text-sm font-medium text-gray-700">
                Wishlist
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="block rounded-lg border py-2.5 text-center text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="block rounded-lg bg-brand-900 py-2.5 text-center text-sm font-medium text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
