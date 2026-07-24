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

  const [ordersRes, historyRes] = await Promise.all([
    db
      .from("orders")
      .select("id, total, payment_method, payment_status, status, created_at, address")
      .order("created_at", { ascending: false }),
    db
      .from("payment_history")
      .select("*, orders(id, address, status)")
      .order("created_at", { ascending: false }),
  ]);

  if (ordersRes.error) {
    return NextResponse.json({ error: ordersRes.error.message }, { status: 500 });
  }

  const orders = ordersRes.data || [];
  const history = historyRes.data || [];

  const summary = {
    totalOrders: orders.length,
    pendingPayments: orders.filter((o) => (o.payment_status || "pending") === "pending").length,
    paidOrders: orders.filter((o) => o.payment_status === "paid").length,
    refundedOrders: orders.filter((o) => o.payment_status === "refunded").length,
    totalCollected: orders
      .filter((o) => o.payment_status === "paid")
      .reduce((sum, o) => sum + Number(o.total), 0),
    totalPending: orders
      .filter((o) => (o.payment_status || "pending") === "pending" && o.status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total), 0),
  };

  return NextResponse.json({ orders, history, summary });
}
