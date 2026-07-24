export type UserRole = "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  username: string | null;
  recovery_email: string | null;
  auth_provider: string | null;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
  sort_order?: number;
  created_at: string;
  subcategories?: Category[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  subcategory_id: string | null;
  brand: string | null;
  material: string | null;
  sizes: string[];
  colors: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
  category?: Category | null;
  subcategory?: Category | null;
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total: number;
  address: OrderAddress;
  payment_method: string;
  tracking_number?: string | null;
  estimated_delivery?: string | null;
  created_at: string;
  order_items?: OrderItem[];
  profiles?: Profile | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
  image_url?: string | null;
}

export interface OrderAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface SavedAddress extends OrderAddress {
  id: string;
  user_id: string;
  label: string;
  is_default: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  profiles?: Profile | null;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  brand?: string;
  material?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  search?: string;
}
