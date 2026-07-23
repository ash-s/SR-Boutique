import { Order, OrderItem } from "./types";
import { formatPrice } from "./utils";
import { BRAND_NAME } from "./constants";

export function buildWhatsAppOrderMessage(
  order: Order,
  items: OrderItem[]
): string {
  const lines = [
    `*New Order from ${BRAND_NAME}*`,
    ``,
    `Order ID: ${order.id.slice(0, 8).toUpperCase()}`,
    `Status: ${order.status}`,
    ``,
    `*Customer Details*`,
    `Name: ${order.address.full_name}`,
    `Phone: ${order.address.phone}`,
    ``,
    `*Delivery Address*`,
    `${order.address.address_line1}`,
    order.address.address_line2 ? `${order.address.address_line2}` : "",
    `${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
    ``,
    `*Items*`,
    ...items.map(
      (item) =>
        `- ${item.product_name} (${item.size || "N/A"}, ${item.color || "N/A"}) x${item.quantity} = ${formatPrice(item.price * item.quantity)}`
    ),
    ``,
    `*Total: ${formatPrice(order.total)}*`,
    `Payment: Cash on Delivery`,
  ].filter(Boolean);

  return lines.join("\n");
}

export function getWhatsAppUrl(message: string): string {
  const number =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919500943141";
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}
