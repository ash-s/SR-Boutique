import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-brand-900">{BRAND_NAME}</h3>
            <p className="mt-2 text-sm text-gray-600">{BRAND_TAGLINE}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Shop</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><Link href="/shop/men" className="hover:text-brand-900">Men</Link></li>
              <li><Link href="/shop/women" className="hover:text-brand-900">Women</Link></li>
              <li><Link href="/shop/kids" className="hover:text-brand-900">Kids</Link></li>
              <li><Link href="/shop/accessories" className="hover:text-brand-900">Accessories</Link></li>
              <li><Link href="/shop" className="hover:text-brand-900">All Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Help</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><Link href="/account" className="hover:text-brand-800">My Account</Link></li>
              <li><Link href="/cart" className="hover:text-brand-800">Cart</Link></li>
              <li>Cash on Delivery available</li>
              <li>Order via WhatsApp</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
