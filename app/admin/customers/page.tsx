import { getAllCustomers, getCustomerOrderCounts } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const [customers, orderCounts] = await Promise.all([
    getAllCustomers(),
    getCustomerOrderCounts(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      <p className="text-sm text-gray-500">{customers.length} registered customers</p>

      <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Orders</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{customer.full_name || "—"}</td>
                  <td className="px-4 py-3">{customer.phone || "—"}</td>
                  <td className="px-4 py-3">{orderCounts[customer.id] || 0}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(customer.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No customers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
