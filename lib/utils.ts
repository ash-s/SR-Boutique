import clsx, { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getEffectivePrice(price: number, salePrice: number | null): number {
  return salePrice && salePrice < price ? salePrice : price;
}

export function getDiscountPercent(price: number, salePrice: number | null): number {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getProductImage(product: {
  product_images?: { image_url: string; sort_order: number }[];
}): string | null {
  if (!product.product_images?.length) return null;
  const sorted = [...product.product_images].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  return sorted[0].image_url;
}
