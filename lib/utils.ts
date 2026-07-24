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
  return normalizeImageUrl(sorted[0].image_url);
}

/** Fix common image URL issues from Supabase storage or uploads */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (supabaseBase && trimmed.startsWith("/storage/")) {
    return `${supabaseBase}${trimmed}`;
  }
  if (supabaseBase && !trimmed.includes("://")) {
    return `${supabaseBase}/storage/v1/object/public/product-images/${trimmed.replace(/^\//, "")}`;
  }

  return trimmed;
}

/** Mask phone for display — e.g. +91 98XX XXX 41 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  const local = digits.slice(-10);
  if (local.length < 4) return "+91 XXXXX XXXXX";
  return `+91 ${local.slice(0, 2)}XX XXX ${local.slice(-2)}`;
}

/** Mask internal phone-auth email for display */
export function maskAuthEmail(email: string | null | undefined): string {
  if (!email) return "Phone account";
  if (!email.endsWith("@phone.srboutique.app")) return email;
  const digits = email.split("@")[0];
  if (digits.length >= 4) {
    return `Phone account (••••${digits.slice(-4)})`;
  }
  return "Phone account";
}
