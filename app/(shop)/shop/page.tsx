import { getCategories, getProducts } from "@/lib/queries";
import { ProductFilters } from "@/lib/types";
import ShopPageClient from "@/components/shop/ShopPageClient";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    color?: string;
    sort?: string;
    search?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const filters: ProductFilters = {
    category: params.category,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    size: params.size,
    color: params.color,
    sort: params.sort as ProductFilters["sort"],
    search: params.search,
  };

  const [products, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);

  return <ShopPageClient products={products} categories={categories} />;
}
