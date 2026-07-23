"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/shop/ProductCard";

const STORAGE_KEY = "sr-recently-viewed";
const MAX_ITEMS = 8;

export function trackRecentlyViewed(product: Product) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: Product[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((p) => p.id !== product.id);
    const next = [product, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list: Product[] = JSON.parse(raw);
      setProducts(list.filter((p) => p.id !== excludeId).slice(0, 4));
    } catch {
      /* ignore */
    }
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
