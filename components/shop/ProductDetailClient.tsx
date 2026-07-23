"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import {
  formatPrice,
  getEffectivePrice,
  getDiscountPercent,
  getProductImage,
  formatDate,
} from "@/lib/utils";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/shop/ProductCard";
import { RecentlyViewed, trackRecentlyViewed } from "@/components/shop/RecentlyViewed";
import { Star, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
  const supabase = createClient();
  const images = product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const [selectedImage, setSelectedImage] = useState(0);
  const [size, setSize] = useState(product.sizes?.[0] || "Free Size");
  const [color, setColor] = useState(product.colors?.[0] || "Default");
  const [added, setAdded] = useState(false);
  const [reviews] = useState(initialReviews);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    trackRecentlyViewed(product);
  }, [product]);

  const effectivePrice = getEffectivePrice(product.price, product.sale_price);
  const discount = getDiscountPercent(product.price, product.sale_price);
  const mainImage = images[selectedImage]?.image_url || getProductImage(product);
  const inWishlist = wishlistLoaded && isInWishlist(product.id);

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setReviewLoading(true);
    setReviewMessage("");

    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      user_id: userId,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });

    if (error) {
      setReviewMessage(error.message);
    } else {
      setReviewMessage("Review submitted! It will appear after admin approval.");
      setReviewForm({ rating: 5, comment: "" });
    }
    setReviewLoading(false);
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
              <Image src={mainImage} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No Image</div>
            )}
            {discount > 0 && (
              <Badge variant="sale" className="absolute left-4 top-4">{discount}% OFF</Badge>
            )}
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
                  <Image src={img.image_url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <button
              type="button"
              onClick={() => toggle(product.id)}
              className={`rounded-full p-2 transition ${
                inWishlist ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500 hover:text-red-500"
              }`}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
            </button>
          </div>
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

          <div className="mt-6 flex gap-3 pb-20 sm:pb-0">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {added ? "Added!" : "Add to Cart"}
            </Button>
            <Link href="/cart" className="hidden sm:block">
              <Button size="lg" variant="outline">View Cart</Button>
            </Link>
          </div>

          {/* Mobile sticky add-to-cart bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 shadow-lg sm:hidden">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{formatPrice(effectivePrice)}</p>
                <p className="truncate text-xs text-gray-500">{size} · {color}</p>
              </div>
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

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {(review.profiles as { full_name?: string })?.full_name || "Customer"}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                </div>
                {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-500">No reviews yet.</p>
        )}

        {userId ? (
          <form onSubmit={handleSubmitReview} className="mt-6 max-w-md space-y-4 rounded-lg border p-4">
            <h3 className="font-medium">Write a Review</h3>
            <div>
              <label className="text-sm">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Stars</option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Your review..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            {reviewMessage && <p className="text-sm text-brand-800">{reviewMessage}</p>}
            <Button type="submit" disabled={reviewLoading}>
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            <Link href="/login" className="text-brand-800 hover:underline">Login</Link> to write a review.
          </p>
        )}
      </section>
    </div>
  );
}
