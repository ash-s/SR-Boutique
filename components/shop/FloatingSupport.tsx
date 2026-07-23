"use client";

import { useState } from "react";
import { MessageCircle, X, Phone, Mail } from "lucide-react";
import { WHATSAPP_NUMBER, BRAND_NAME } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const whatsappUrl = getWhatsAppUrl(
    `Hi ${BRAND_NAME}, I need help with my order or a product.`
  );

  return (
    <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-3 w-72 rounded-xl border bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">Customer Support</p>
              <p className="mt-1 text-xs text-gray-500">We typically reply within a few hours</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100"
              aria-label="Close support panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-green-800 hover:bg-green-100"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <p className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4" />
              +91 {WHATSAPP_NUMBER.slice(2)}
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              support@srboutique.app
            </p>
            <p className="text-xs text-gray-500">
              Mon–Sat, 10 AM – 7 PM. For order updates, check My Account → Orders.
            </p>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-900 text-white shadow-lg transition hover:bg-brand-800 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        aria-label="Customer support"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
