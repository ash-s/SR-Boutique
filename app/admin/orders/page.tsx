import { getAllOrders } from "@/lib/queries";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  return <AdminOrdersClient orders={orders} />;
}
