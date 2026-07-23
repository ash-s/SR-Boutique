import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";
import { buildWhatsAppOrderMessage, getWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { CheckCircle, MessageCircle, Info } from "lucide-react";
import { Order, OrderItem } from "@/lib/types";

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const orderData = order as Order;
  const items = (order.order_items || []) as OrderItem[];
  const whatsappMessage = buildWhatsAppOrderMessage(orderData, items);
  const whatsappUrl = getWhatsAppUrl(whatsappMessage);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Order Placed Successfully!</h1>
        <p className="mt-2 text-gray-600">
          Order ID: <span className="font-mono font-semibold">{id.slice(0, 8).toUpperCase()}</span>
        </p>
        <Badge className="mt-2">{ORDER_STATUS_LABELS[order.status] || order.status}</Badge>
        <p className="mt-1 text-sm text-gray-500">{formatDate(order.created_at)}</p>
      </div>

      <div className="mt-8 rounded-lg border p-6">
        <h2 className="font-semibold">Order Details</h2>
        <div className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {item.image_url && (
                  <div className="relative h-14 w-14 overflow-hidden rounded-md bg-gray-100">
                    <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                  </div>
                )}
                <span>
                  {item.product_name} ({item.size}, {item.color}) x{item.quantity}
                </span>
              </div>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-4 flex justify-between font-semibold">
          <span>Total (COD)</span>
          <span>{formatPrice(order.total)}</span>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Deliver to: {order.address.full_name}</p>
          <p>{order.address.address_line1}, {order.address.city} - {order.address.pincode}</p>
          <p>Phone: {order.address.phone}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">How order confirmation works</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-blue-800">
              <li>Your order is saved on our website with status <strong>Order Placed</strong>.</li>
              <li>WhatsApp sends us your order details — you do <strong>not</strong> need to confirm again there.</li>
              <li>We will confirm via phone/WhatsApp and update status to Confirmed → Out for Delivery → Delivered.</li>
              <li>Track status anytime in <Link href="/account/orders" className="underline">My Account → Orders</Link>.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <Button size="lg" variant="outline" className="w-full gap-2">
            <MessageCircle className="h-5 w-5" />
            Notify Us on WhatsApp (Optional)
          </Button>
        </a>
        <p className="text-center text-xs text-gray-500">
          Speeds up processing — shares your order summary with our team
        </p>
        <Link href="/shop">
          <Button className="w-full">Continue Shopping</Button>
        </Link>
        <Link href="/account/orders" className="block text-center text-sm text-brand-800 hover:underline">
          View My Orders
        </Link>
      </div>
    </div>
  );
}
