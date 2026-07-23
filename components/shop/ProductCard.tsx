"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import {
  formatPrice,
  getEffectivePrice,
  getDiscountPercent,
  getProductImage,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { Button } from "@/components/ui/Button";
import { Heart, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: Product;
  showWishlist?: boolean;
}

export function ProductCard({ product, showWishlist = true }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggle, isLoaded: wishlistLoaded } = useWishlist();
  const imageUrl = getProductImage(product);
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
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400 sm:text-sm">
            No Image
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discount > 0 && <Badge variant="sale">{discount}% OFF</Badge>}
          {isNew && !discount && <Badge className="bg-brand-900 text-white">NEW</Badge>}
        </div>

        {showWishlist && (
          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute right-2 top-2 rounded-full p-1.5 shadow-sm transition ${
              inWishlist ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-600 hover:text-red-500"
            }`}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 sm:translate-y-full sm:transition-transform sm:group-hover:translate-y-0">
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
