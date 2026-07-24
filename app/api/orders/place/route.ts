import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEffectivePrice } from "@/lib/utils";
import { OrderAddress } from "@/lib/types";

interface PlaceOrderItem {
  product_id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  sale_price: number | null;
  image_url: string | null;
}

interface PlaceOrderBody {
  total: number;
  address: OrderAddress;
  payment_method?: string;
  items: PlaceOrderItem[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlaceOrderBody;

    if (!body.items?.length || !body.address || body.total == null) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const rpcItems = body.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: getEffectivePrice(item.price, item.sale_price),
      image_url: item.image_url,
    }));

    const { data: orderId, error: rpcError } = await supabase.rpc("place_order_with_stock", {
      p_user_id: user?.id || null,
      p_total: body.total,
      p_address: body.address,
      p_payment_method: body.payment_method || "cod",
      p_items: rpcItems,
    });

    if (!rpcError && orderId) {
      return NextResponse.json({ orderId });
    }

    // Fallback when migration not yet applied: use service role
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        {
          error:
            rpcError?.message ||
            "Could not place order. Run migration 012_inventory_payments.sql in Supabase.",
        },
        { status: 500 }
      );
    }

    for (const item of body.items) {
      const { data: product } = await admin
        .from("products")
        .select("stock, name")
        .eq("id", item.product_id)
        .single();

      if (!product) {
        return NextResponse.json({ error: `Product not found` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
          },
          { status: 400 }
        );
      }
    }

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user?.id || null,
        status: "pending",
        total: body.total,
        address: body.address,
        payment_method: body.payment_method || "cod",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || "Failed to create order" }, { status: 500 });
    }

    for (const item of body.items) {
      const price = getEffectivePrice(item.price, item.sale_price);

      await admin.from("order_items").insert({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price,
        image_url: item.image_url,
        item_status: "active",
      });

      const { data: product } = await admin
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();

      await admin
        .from("products")
        .update({ stock: Math.max((product?.stock || 0) - item.quantity, 0) })
        .eq("id", item.product_id);
    }

    await admin.from("payment_history").insert({
      order_id: order.id,
      amount: body.total,
      payment_method: body.payment_method || "cod",
      payment_status: "pending",
      notes: "Order placed",
    });

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to place order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
