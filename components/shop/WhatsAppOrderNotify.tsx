"use client";

import { useEffect } from "react";

interface WhatsAppOrderNotifyProps {
  orderId: string;
  whatsappUrl: string;
}

/** Opens WhatsApp to admin if server-side notify did not auto-send */
export function WhatsAppOrderNotify({ orderId, whatsappUrl }: WhatsAppOrderNotifyProps) {
  useEffect(() => {
    if (sessionStorage.getItem(`order-wa-sent-${orderId}`)) return;

    const key = `wa-notify-${orderId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const timer = setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 1500);

    return () => clearTimeout(timer);
  }, [orderId, whatsappUrl]);

  return null;
}
