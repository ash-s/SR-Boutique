import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWishlist } from "@/lib/queries";
import { ProductCard } from "@/components/shop/ProductCard";
import { Product } from "@/lib/types";
import Link from "next/link";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/wishlist");

  const wishlist = await getWishlist(user.id);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">My Wishlist</h1>
      <p className="mt-1 text-sm text-gray-500">Items you saved for later</p>

      {wishlist.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {wishlist.map((item) => (
            <ProductCard key={item.id} product={item.product as Product} showWishlist />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed py-12 text-center">
          <p className="text-gray-500">Your wishlist is empty.</p>
          <Link href="/shop" className="mt-3 inline-block text-sm font-medium text-brand-800 hover:underline">
            Browse products
          </Link>
        </div>
      )}
    </div>
  );
}
