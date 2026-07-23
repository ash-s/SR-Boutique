"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductCard } from "@/components/shop/ProductCard";
import { SlidersHorizontal } from "lucide-react";
import { Product, Category } from "@/lib/types";

function ShopContent({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [mobileFilters, setMobileFilters] = useState(false);
  const searchParams = useSearchParams();
  const search = searchParams?.get("search");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : "All Products"}
          </h1>
          <p className="text-sm text-gray-500">{products.length} products</p>
        </div>
        <button
          onClick={() => setMobileFilters(true)}
          className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        <Suspense fallback={null}>
          <FilterSidebar categories={categories} />
        </Suspense>

        {mobileFilters && (
          <Suspense fallback={null}>
            <FilterSidebar
              categories={categories}
              mobile
              onClose={() => setMobileFilters(false)}
            />
          </Suspense>
        )}

        <div className="flex-1">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center text-gray-500">
              No products found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPageWrapper({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ShopContent products={products} categories={categories} />
    </Suspense>
  );
}
