import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  const auth = await verifyAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const admin = createAdminClient();
  const db = admin || (await createClient());

  const [productsRes, itemsRes, movementsRes] = await Promise.all([
    db
      .from("products")
      .select(
        "id, name, slug, stock, is_active, category:categories!products_category_id_fkey(id, name), subcategory:categories!products_subcategory_id_fkey(id, name)"
      )
      .order("name"),
    db
      .from("order_items")
      .select("*, orders(id, status, created_at, address)")
      .in("item_status", ["returned", "replaced", "cancelled"])
      .order("id", { ascending: false }),
    db
      .from("inventory_movements")
      .select("*, products(name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (productsRes.error) {
    return NextResponse.json({ error: productsRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    products: productsRes.data || [],
    specialItems: itemsRes.data || [],
    movements: movementsRes.data || [],
  });
}
