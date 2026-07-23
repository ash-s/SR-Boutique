import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategories, getProducts, getSubcategories } from "@/lib/queries";
import { CategoryShopClient } from "@/components/shop/CategoryShopClient";
import { ProductFilters } from "@/lib/types";
import { MAIN_CATEGORIES } from "@/lib/constants";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const sp = await searchParams;

  const valid = MAIN_CATEGORIES.some((c) => c.slug === category);
  if (!valid) notFound();

  const filters: ProductFilters = {
    category,
    subcategory: sp.subcategory,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    size: sp.size,
    color: sp.color,
    brand: sp.brand,
    material: sp.material,
    sort: sp.sort as ProductFilters["sort"],
  };

  const [categories, products, subcategories] = await Promise.all([
    getCategories(),
    getProducts(filters),
    getSubcategories(category),
  ]);

  const categoryName = MAIN_CATEGORIES.find((c) => c.slug === category)?.name || category;

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CategoryShopClient
        products={products}
        categories={categories}
        mainCategory={category}
        categoryName={categoryName}
        subcategories={subcategories}
      />
    </Suspense>
  );
}
