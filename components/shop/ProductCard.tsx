"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import {
  formatPrice,
  getEffectivePrice,
  getDiscountPercent,
  getProductImage,
  normalizeImageUrl,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/shop/ProductImage";
import { Heart, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  showWishlist?: boolean;
}

export function ProductCard({ product, showWishlist = true }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggle, isLoaded: wishlistLoaded } = useWishlist();
  const imageUrl = normalizeImageUrl(getProductImage(product));
  const effectivePrice = getEffectivePrice(product.price, product.sale_price);
  const discount = getDiscountPercent(product.price, product.sale_price);
  const defaultSize = product.sizes?.[0] || "Free Size";
  const defaultColor = product.colors?.[0] || "Default";
  const isNew =
    product.created_at &&
    Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 60 * 60 * 1000;
  const inWishlist = wishlistLoaded && isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      sale_price: product.sale_price,
      image_url: imageUrl,
      size: defaultSize,
      color: defaultColor,
      stock: product.stock,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
        {imageUrl ? (
          <ProductImage
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400 sm:text-sm">
            No Image
          </div>
        )}

        <div className="absolute left-2 top-2 z-20 flex flex-col gap-1">
          {discount > 0 && <Badge variant="sale">{discount}% OFF</Badge>}
          {isNew && !discount && <Badge className="bg-brand-900 text-white">NEW</Badge>}
        </div>

        {showWishlist && (
          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-md transition ${
              inWishlist
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-500"
            }`}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 z-20 bg-black/60 p-2 sm:translate-y-full sm:transition-transform sm:group-hover:translate-y-0">
          <Button size="sm" className="w-full gap-1 text-xs sm:text-sm" onClick={handleAddToCart}>
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </Button>
        </div>
      </div>
      <div className="mt-2 sm:mt-3">
        <h3 className="line-clamp-2 text-xs font-medium text-gray-900 group-hover:text-brand-800 sm:text-sm">
          {product.name}
        </h3>
        {product.brand && (
          <p className="mt-0.5 truncate text-[10px] text-gray-500 sm:text-xs">{product.brand}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-sm font-semibold text-gray-900 sm:text-base">
            {formatPrice(effectivePrice)}
          </span>
          {product.sale_price && product.sale_price < product.price && (
            <span className="text-[10px] text-gray-500 line-through sm:text-xs">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
