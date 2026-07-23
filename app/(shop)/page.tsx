import Link from "next/link";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { CategoryTiles } from "@/components/shop/CategoryTiles";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCategories, getProducts } from "@/lib/queries";

export default async function HomePage() {
  const [categories, newArrivals, bestSellers] = await Promise.all([
    getCategories(),
    getProducts(undefined, 8),
    getProducts({ sort: "price_desc" }, 4),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      <HeroCarousel />

      <section className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Shop by Category</h2>
        <CategoryTiles categories={categories} />
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
          <Link href="/shop" className="text-sm font-medium text-brand-800 hover:underline">
            View All
          </Link>
        </div>
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-gray-500 sm:p-12">
            <p>New arrivals coming soon.</p>
            <Link href="/shop" className="mt-2 inline-block text-sm font-medium text-brand-800 hover:underline">
              Browse all categories
            </Link>
          </div>
        )}
      </section>

      {bestSellers.length > 0 && (
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Premium Picks</h2>
            <Link href="/shop?sort=price_desc" className="text-sm font-medium text-brand-800 hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-xl border border-gray-200 bg-surface px-6 py-10 text-center">
        <h2 className="text-2xl font-semibold text-brand-900">Order with Cash on Delivery</h2>
        <p className="mt-2 text-gray-600">
          Shop online and pay when your order arrives. Confirm via WhatsApp for faster processing.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-block rounded-md bg-brand-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-800"
        >
          Start Shopping
        </Link>
      </section>
    </div>
  );
}
