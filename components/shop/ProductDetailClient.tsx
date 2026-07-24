"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import {
  formatPrice,
  getEffectivePrice,
  getDiscountPercent,
  getProductImage,
  normalizeImageUrl,
} from "@/lib/utils";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductImage } from "@/components/shop/ProductImage";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { RecentlyViewed, trackRecentlyViewed } from "@/components/shop/RecentlyViewed";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";

interface ProductDetailClientProps {
  product: Product;
  reviews: import("@/lib/types").Review[];
  userId: string | null;
  similarProducts: Product[];
}

export function ProductDetailClient({
  product,
  reviews: initialReviews,
  userId,
  similarProducts,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggle, isLoaded: wishlistLoaded } = useWishlist();
  const images = product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const [selectedImage, setSelectedImage] = useState(0);
  const [size, setSize] = useState(product.sizes?.[0] || "Free Size");
  const [color, setColor] = useState(product.colors?.[0] || "Default");
  const [added, setAdded] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);

  useEffect(() => {
    trackRecentlyViewed(product);
  }, [product]);

  const effectivePrice = getEffectivePrice(product.price, product.sale_price);
  const discount = getDiscountPercent(product.price, product.sale_price);
  const mainImage = normalizeImageUrl(
    images[selectedImage]?.image_url || getProductImage(product)
  );
  const inWishlist = wishlistLoaded && isInWishlist(product.id);

  const handleWishlist = async () => {
    await toggle(product.id);
    if (!inWishlist) {
      setWishlistAdded(true);
      setTimeout(() => setWishlistAdded(false), 2000);
    }
  };

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      sale_price: product.sale_price,
      image_url: mainImage,
      size,
      color,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/shop" className="hover:text-brand-800">Shop</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/shop/${product.category.slug}`} className="hover:text-brand-800">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
            {mainImage ? (
              <ProductImage src={mainImage} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
            )}
            {discount > 0 && (
              <Badge variant="sale" className="absolute left-3 top-3 z-10">{discount}% OFF</Badge>
            )}
            <button
              type="button"
              onClick={handleWishlist}
              className={`absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full px-3 py-2 shadow-md transition ${
                inWishlist
                  ? "bg-red-500 text-white"
                  : "bg-white/95 text-gray-800 hover:bg-white hover:text-red-500"
              }`}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">{inWishlist ? "Saved" : "Wishlist"}</span>
            </button>
            <div className="absolute inset-x-0 bottom-0 z-10 bg-black/60 p-3">
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingBag className="h-4 w-4" />
                {added ? "Added to Cart!" : "Add to Cart"}
              </Button>
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                    i === selectedImage ? "border-brand-800" : "border-transparent"
                  }`}
                >
                  <ProductImage src={img.image_url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          {inWishlist && (
            <p className="mt-1 text-sm font-medium text-red-500">
              {wishlistAdded ? "Added to wishlist!" : "Saved in your wishlist"}
            </p>
          )}
          {(product.brand || product.material) && (
            <p className="mt-1 text-sm text-gray-500">
              {[product.brand, product.material].filter(Boolean).join(" · ")}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-bold">{formatPrice(effectivePrice)}</span>
            {product.sale_price && product.sale_price < product.price && (
              <span className="text-lg text-gray-500 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          {product.description && (
            <p className="mt-4 text-gray-600">{product.description}</p>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Size</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-md border px-4 py-2 text-sm ${
                      size === s ? "border-brand-800 bg-brand-50 text-brand-900" : "border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Color</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-md border px-4 py-2 text-sm ${
                      color === c ? "border-brand-800 bg-brand-50 text-brand-900" : "border-gray-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <div className="mt-6 flex flex-col gap-3 pb-20 sm:pb-0">
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {added ? "Added!" : "Add to Cart"}
            </Button>
            <Link href="/cart" className="hidden sm:block">
              <Button size="lg" variant="outline" className="w-full">View Cart</Button>
            </Link>
          </div>

          {/* Mobile sticky add-to-cart bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 shadow-lg sm:hidden">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{formatPrice(effectivePrice)}</p>
                <p className="truncate text-xs text-gray-500">{size} · {color}</p>
              </div>
              <button
                type="button"
                onClick={handleWishlist}
                className={`rounded-lg border p-2.5 ${inWishlist ? "border-red-200 bg-red-50 text-red-500" : "border-gray-300"}`}
                aria-label="Add to wishlist"
              >
                <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
              </button>
              <Button
                className="flex-shrink-0"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                {added ? "Added!" : "Add to Cart"}
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p>Cash on Delivery available</p>
            <p className="mt-1">Free returns within 7 days</p>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900">Similar Products</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />

      <ProductReviews
        productId={product.id}
        initialReviews={initialReviews}
        userId={userId}
      />
    </div>
  );
}
