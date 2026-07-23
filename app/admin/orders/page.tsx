import { getAllOrders } from "@/lib/queries";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  return (
    <>
      <AdminSetupNotice />
      <AdminOrdersClient orders={orders} />
    </>
  );
}
