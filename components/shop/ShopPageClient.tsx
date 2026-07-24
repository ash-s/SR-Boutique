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
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {search ? `Results for "${search}"` : "All Products"}
          </h1>
          <p className="text-sm text-gray-500">{products.length} products</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileFilters(true)}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="flex items-start gap-8">
        <aside className="sticky top-20 hidden max-h-[calc(100vh-5rem)] w-64 flex-shrink-0 self-start overflow-y-auto lg:block">
          <Suspense fallback={null}>
            <FilterSidebar categories={categories} />
          </Suspense>
        </aside>

        <div className="min-w-0 flex-1">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed py-16 text-center text-gray-500">
              No products found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileFilters(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Suspense fallback={null}>
              <FilterSidebar
                categories={categories}
                mobile
                onClose={() => setMobileFilters(false)}
              />
            </Suspense>
          </div>
        </div>
      )}
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
