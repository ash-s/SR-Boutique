import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/queries";
import { AccountOrdersClient } from "@/components/account/AccountOrdersClient";
import { Order } from "@/lib/types";

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/orders");

  const orders = (await getUserOrders(user.id)) as Order[];

  return (
    <div className="card">
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-xl font-bold text-gray-900">Order History</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tap any order to track delivery and view details
        </p>
      </div>

      <AccountOrdersClient orders={orders} />
    </div>
  );
}
