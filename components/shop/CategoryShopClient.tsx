"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductCard } from "@/components/shop/ProductCard";
import { SlidersHorizontal } from "lucide-react";
import { Product, Category } from "@/lib/types";

interface CategoryShopClientProps {
  products: Product[];
  categories: Category[];
  mainCategory: string;
  categoryName: string;
  subcategories: Category[];
}

export function CategoryShopClient({
  products,
  categories,
  mainCategory,
  categoryName,
  subcategories,
}: CategoryShopClientProps) {
  const [mobileFilters, setMobileFilters] = useState(false);
  const searchParams = useSearchParams();
  const sub = searchParams?.get("subcategory");
  const subName = subcategories.find((s) => s.slug === sub)?.name;

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {subName ? `${categoryName} — ${subName}` : categoryName}
        </h1>
        <p className="text-sm text-gray-500">{products.length} products</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <FilterSidebar
            categories={categories}
            mainCategory={mainCategory}
            subcategories={subcategories}
          />
        </aside>

        <div className="flex-1">
          <button
            type="button"
            onClick={() => setMobileFilters(true)}
            className="mb-4 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed py-16 text-center text-gray-500">
              No products found. Try changing filters.
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileFilters(false)}>
          <div className="absolute right-0 top-0 h-full w-80 overflow-y-auto bg-white" onClick={(e) => e.stopPropagation()}>
            <FilterSidebar
              categories={categories}
              mainCategory={mainCategory}
              subcategories={subcategories}
              mobile
              onClose={() => setMobileFilters(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
