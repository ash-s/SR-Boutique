"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/shop/ProductImage";
import { formatPrice, getEffectivePrice } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, isLoaded } = useCart();

  if (!isLoaded) {
    return <div className="p-8 text-center">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Add some products to get started.</p>
        <Link href="/shop">
          <Button className="mt-6">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Shopping Cart</h1>
      <p className="mt-1 text-sm text-gray-500">{items.length} item(s) in your bag</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => {
            const price = getEffectivePrice(item.price, item.sale_price);
            return (
              <div
                key={`${item.product_id}-${item.size}-${item.color}`}
                className="card flex gap-4 !p-4"
              >
                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {item.image_url ? (
                    <ProductImage src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">No img</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/product/${item.product_id}`} className="font-medium hover:text-brand-800">
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      Size: {item.size} | Color: {item.color}
                    </p>
                    <p className="mt-1 font-semibold">{formatPrice(price)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                        className="rounded border p-1 hover:bg-gray-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                        className="rounded border p-1 hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id, item.size, item.color)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">Cash on Delivery</p>
          <Link href="/checkout" className="mt-4 block">
            <Button className="w-full" size="lg">Proceed to Checkout</Button>
          </Link>
          <Link href="/shop" className="mt-2 block text-center text-sm text-brand-800 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
