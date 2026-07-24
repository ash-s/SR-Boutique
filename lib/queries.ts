import { createClient } from "@/lib/supabase/server";
import { Product, ProductFilters } from "@/lib/types";

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");
  return data || [];
}

export async function getMainCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("sort_order");
  return data || [];
}

export async function getSubcategories(parentSlug: string) {
  const supabase = await createClient();
  const { data: parent } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", parentSlug)
    .maybeSingle();
  if (!parent) return [];

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("parent_id", parent.id)
    .order("sort_order");
  return data || [];
}

export async function getProducts(filters?: ProductFilters, limit?: number) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, category:categories!products_category_id_fkey(*), subcategory:categories!products_subcategory_id_fkey(*), product_images(*)")
    .eq("is_active", true);

  if (filters?.subcategory) {
    const { data: sub } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.subcategory)
      .maybeSingle();
    if (sub) query = query.eq("subcategory_id", sub.id);
  } else if (filters?.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();
    if (cat) {
      const { data: subs } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", cat.id);
      const ids = [cat.id, ...(subs?.map((s) => s.id) || [])];
      query = query.in("category_id", ids);
    }
  }

  if (filters?.minPrice) query = query.gte("price", filters.minPrice);
  if (filters?.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters?.size) query = query.contains("sizes", [filters.size]);
  if (filters?.color) query = query.contains("colors", [filters.color]);
  if (filters?.brand) query = query.eq("brand", filters.brand);
  if (filters?.material) query = query.eq("material", filters.material);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

  if (filters?.sort === "price_asc") query = query.order("price", { ascending: true });
  else if (filters?.sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data } = await query;
  return (data as Product[]) || [];
}

export async function getSimilarProducts(productId: string, categoryId: string | null, limit = 4) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_active", true)
    .neq("id", productId)
    .limit(limit);

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data } = await query;
  return (data as Product[]) || [];
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories!products_category_id_fkey(*), subcategory:categories!products_subcategory_id_fkey(*), product_images(*)")
    .eq("id", id)
    .single();
  return data as Product | null;
}

export async function getProductsByCategorySlug(slug: string, filters?: ProductFilters) {
  return getProducts({ ...filters, category: slug });
}

export async function getApprovedReviews(productId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getAllProductsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories!products_category_id_fkey(*), subcategory:categories!products_subcategory_id_fkey(*), product_images(*)")
    .order("created_at", { ascending: false });
  return (data as Product[]) || [];
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function getUserOrders(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getOrderById(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .maybeSingle();
    if (data) return data;
  }

  const { data: publicOrder } = await supabase.rpc("get_public_order", { order_id: orderId });
  return publicOrder;
}

export async function getAdminStats() {
  const supabase = await createClient();

  const [ordersRes, customersRes, productsRes, revenueRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total").neq("status", "cancelled"),
  ]);

  const totalRevenue = revenueRes.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

  return {
    totalOrders: ordersRes.count || 0,
    totalCustomers: customersRes.count || 0,
    totalProducts: productsRes.count || 0,
    totalRevenue,
  };
}

export async function getAllOrders() {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  if (admin) {
    const { data, error } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (!error && data) return data;
  }

  const supabase = await createClient();
  const { data: rpcData, error: rpcError } = await supabase.rpc("admin_get_all_orders");
  if (!rpcError && rpcData) {
    return Array.isArray(rpcData) ? rpcData : [];
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllOrders error:", error.message);
    return [];
  }
  return data || [];
}

export async function getAllCustomers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getAllReviews() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, profiles(full_name), products(id, name)")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getSavedAddresses(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });
  return data || [];
}

export async function getWishlist(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlist")
    .select("*, product:products(*, product_images(*))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getCustomerOrderCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("user_id");
  const counts: Record<string, number> = {};
  for (const row of data || []) {
    if (row.user_id) {
      counts[row.user_id] = (counts[row.user_id] || 0) + 1;
    }
  }
  return counts;
}
