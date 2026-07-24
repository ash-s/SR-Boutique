export const BRAND_NAME = "SR Boutique";
export const BRAND_TAGLINE = "Curated fashion for every occasion";

export const WHATSAPP_NUMBER = "919500943141";

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const COLORS = [
  "Black", "White", "Red", "Blue", "Green", "Pink", "Yellow", "Beige", "Brown", "Multicolor",
] as const;

export const MATERIALS = [
  "Cotton", "Polyester", "Silk", "Linen", "Denim", "Wool", "Rayon", "Blend",
] as const;

export const BRANDS = [
  "SR Boutique", "Urban Fit", "Classic Wear", "Comfort Line", "Style Hub",
] as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  shipped: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Short labels for compact UI chips */
export const ORDER_STATUS_SHORT_LABELS: Record<string, string> = {
  pending: "Placed",
  confirmed: "Confirmed",
  shipped: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "refunded",
  "partial_refund",
  "failed",
] as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  refunded: "Refunded",
  partial_refund: "Partial Refund",
  failed: "Failed",
};

export const ORDER_ITEM_STATUSES = [
  "active",
  "returned",
  "replaced",
  "cancelled",
] as const;

export const ORDER_ITEM_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  returned: "Returned",
  replaced: "Replaced",
  cancelled: "Cancelled",
};

export const LOW_STOCK_THRESHOLD = 5;

export const MAIN_CATEGORIES = [
  { name: "Men", slug: "men" },
  { name: "Women", slug: "women" },
  { name: "Kids", slug: "kids" },
  { name: "Accessories", slug: "accessories" },
] as const;

/** Subcategories for mega menu (fallback if DB empty) */
export const SUBCATEGORIES: Record<string, { name: string; slug: string }[]> = {
  men: [
    { name: "Shirts", slug: "men-shirts" },
    { name: "T-Shirts", slug: "men-tshirts" },
    { name: "Pants", slug: "men-pants" },
    { name: "Jeans", slug: "men-jeans" },
    { name: "Kurtas", slug: "men-kurtas" },
    { name: "Innerwear", slug: "men-innerwear" },
    { name: "Shorts", slug: "men-shorts" },
  ],
  women: [
    { name: "Sarees", slug: "women-sarees" },
    { name: "Kurtis", slug: "women-kurtis" },
    { name: "Tops", slug: "women-tops" },
    { name: "Dresses", slug: "women-dresses" },
    { name: "Jeans", slug: "women-jeans" },
    { name: "Leggings", slug: "women-leggings" },
    { name: "Innerwear", slug: "women-innerwear" },
  ],
  kids: [
    { name: "Boys Clothing", slug: "kids-boys" },
    { name: "Girls Clothing", slug: "kids-girls" },
    { name: "Infants", slug: "kids-infants" },
    { name: "School Wear", slug: "kids-school" },
  ],
  accessories: [
    { name: "Bags", slug: "acc-bags" },
    { name: "Belts", slug: "acc-belts" },
    { name: "Jewellery", slug: "acc-jewellery" },
    { name: "Watches", slug: "acc-watches" },
    { name: "Sunglasses", slug: "acc-sunglasses" },
  ],
};

export const CATEGORY_IMAGES: Record<string, string> = {
  men: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=400&fit=crop&auto=format",
  women: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=400&fit=crop&auto=format",
  kids: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&h=400&fit=crop&auto=format",
  accessories: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop&auto=format",
};
