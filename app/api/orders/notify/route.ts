import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildWhatsAppOrderMessage } from "@/lib/whatsapp";
import { sendWhatsAppToAdmin } from "@/lib/notify-admin";
import { Order, OrderItem } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    let order: Order | null = null;
    let items: OrderItem[] = [];

    const admin = createAdminClient();
    if (admin) {
      const { data } = await admin
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .single();
      if (data) {
        order = data as Order;
        items = (data.order_items || []) as OrderItem[];
      }
    }

    if (!order) {
      const supabase = await createClient();
      const { data } = await supabase.rpc("get_public_order", { order_id: orderId });
      if (data) {
        order = data as Order;
        items = (data.order_items || []) as OrderItem[];
      }
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const message = buildWhatsAppOrderMessage(order, items);
    const result = await sendWhatsAppToAdmin(message);

    return NextResponse.json({
      ok: true,
      sent: result.sent,
      method: result.method,
      whatsappUrl: result.whatsappUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Notify failed" },
      { status: 500 }
    );
  }
}
