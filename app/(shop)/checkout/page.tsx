"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, getEffectivePrice } from "@/lib/utils";
import { OrderAddress } from "@/lib/types";

export default function CheckoutPage() {
  const { items, total, clearCart, isLoaded } = useCart();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState<OrderAddress>({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  if (!isLoaded) return <div className="p-8 text-center">Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Nothing to checkout</h1>
        <Link href="/shop"><Button className="mt-4">Go Shopping</Button></Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          status: "pending",
          total,
          address,
          payment_method: "cod",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: getEffectivePrice(item.price, item.sale_price),
        image_url: item.image_url || null,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      router.push(`/order-success/${order.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      <p className="text-sm text-gray-500">Cash on Delivery — pay when your order arrives</p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Delivery Address</h2>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <Input
            label="Full Name"
            value={address.full_name}
            onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            required
          />
          <Input
            label="Address Line 1"
            value={address.address_line1}
            onChange={(e) => setAddress({ ...address, address_line1: e.target.value })}
            required
          />
          <Input
            label="Address Line 2 (optional)"
            value={address.address_line2 || ""}
            onChange={(e) => setAddress({ ...address, address_line2: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              required
            />
            <Input
              label="State"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              required
            />
          </div>
          <Input
            label="Pincode"
            value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
            required
          />

          {!address.full_name && (
            <p className="text-sm text-gray-500">
              <Link href="/login" className="text-brand-800 hover:underline">Login</Link> to track your orders.
            </p>
          )}
        </div>

        <div className="h-fit rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={`${item.product_id}-${item.size}`} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatPrice(getEffectivePrice(item.price, item.sale_price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-4 flex justify-between font-semibold">
            <span>Total (COD)</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button type="submit" className="mt-6 w-full" size="lg" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
