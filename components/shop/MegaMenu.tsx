"use client";

import Link from "next/link";
import { useState } from "react";
import { MAIN_CATEGORIES, SUBCATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MegaMenu() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {MAIN_CATEGORIES.map((cat) => (
        <div
          key={cat.slug}
          className="relative"
          onMouseEnter={() => setOpen(cat.slug)}
          onMouseLeave={() => setOpen(null)}
        >
          <Link
            href={`/shop/${cat.slug}`}
            className={cn(
              "block px-4 py-2 text-sm font-medium transition-colors hover:text-brand-700",
              open === cat.slug ? "text-brand-800" : "text-gray-700"
            )}
          >
            {cat.name}
          </Link>

          {open === cat.slug && (
            <div className="absolute left-0 top-full z-50 min-w-[220px] rounded-lg border border-gray-200 bg-white py-3 shadow-xl">
              <Link
                href={`/shop/${cat.slug}`}
                className="block px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-gray-50"
              >
                All {cat.name}
              </Link>
              <div className="my-1 border-t" />
              {(SUBCATEGORIES[cat.slug] || []).map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/shop/${cat.slug}?subcategory=${sub.slug}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-800"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
