"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { OrderStatusBadge } from "@/components/shared/OrderStatusBadge";
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import { IndianRupee, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PaymentStatus } from "@/lib/types";

interface PaymentOrder {
  id: string;
  total: number;
  payment_method: string;
  payment_status?: string;
  status: string;
  created_at: string;
  address?: { full_name?: string; phone?: string };
}

interface PaymentHistoryRow {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  orders?: { id: string; address?: { full_name?: string }; status?: string } | null;
}

interface PaymentSummary {
  totalOrders: number;
  pendingPayments: number;
  paidOrders: number;
  refundedOrders: number;
  totalCollected: number;
  totalPending: number;
}

export function AdminPaymentsClient() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [history, setHistory] = useState<PaymentHistoryRow[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/payments", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load payments");
        return;
      }
      setOrders(data.orders || []);
      setHistory(data.history || []);
      setSummary(data.summary || null);
    } catch {
      setError("Could not connect to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    setError("");
    const { error: rpcError } = await supabase.rpc("record_order_payment", {
      p_order_id: orderId,
      p_payment_status: paymentStatus,
      p_notes: `Marked as ${PAYMENT_STATUS_LABELS[paymentStatus]}`,
    });

    if (rpcError) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ payment_status: paymentStatus })
        .eq("id", orderId);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_status: paymentStatus } : o))
    );
    load();
  };

  const filtered = filter
    ? orders.filter((o) => (o.payment_status || "pending") === filter)
    : orders;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">Payment details and transaction history</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {summary && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Collected (Paid)</p>
            <p className="mt-1 flex items-center gap-1 text-xl font-bold text-green-700">
              <IndianRupee className="h-5 w-5" />
              {formatPrice(summary.totalCollected)}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Pending (COD)</p>
            <p className="mt-1 text-xl font-bold text-amber-700">
              {formatPrice(summary.totalPending)}
            </p>
            <p className="text-xs text-gray-500">{summary.pendingPayments} orders</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Paid Orders</p>
            <p className="mt-1 text-xl font-bold">{summary.paidOrders}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">Refunded</p>
            <p className="mt-1 text-xl font-bold text-red-700">{summary.refundedOrders}</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Order Payments</h2>
          <Select
            options={[
              { value: "", label: "All Payments" },
              ...PAYMENT_STATUSES.map((s) => ({
                value: s,
                label: PAYMENT_STATUS_LABELS[s] || s,
              })),
            ]}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-40 text-xs [&_select]:h-8 [&_select]:py-1"
          />
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Method</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Order Status</th>
                <th className="px-4 py-3 text-left font-medium">Payment</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">{order.address?.full_name || "Guest"}</td>
                    <td className="px-4 py-3 uppercase">{order.payment_method || "cod"}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          order.payment_status === "paid"
                            ? "success"
                            : order.payment_status === "refunded"
                              ? "sale"
                              : "warning"
                        }
                      >
                        {PAYMENT_STATUS_LABELS[order.payment_status || "pending"] || "Pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <Select
                        options={PAYMENT_STATUSES.map((s) => ({
                          value: s,
                          label: PAYMENT_STATUS_LABELS[s] || s,
                        }))}
                        value={order.payment_status || "pending"}
                        onChange={(e) =>
                          updatePaymentStatus(order.id, e.target.value as PaymentStatus)
                        }
                        className="w-28 text-xs [&_select]:h-8 [&_select]:py-1 [&_select]:text-xs"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No payment records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Payment History</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Method</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-gray-500">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      #{row.order_id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      {row.orders?.address?.full_name || "Guest"}
                    </td>
                    <td className="px-4 py-3">{formatPrice(row.amount)}</td>
                    <td className="px-4 py-3 uppercase">{row.payment_method}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          row.payment_status === "paid"
                            ? "success"
                            : row.payment_status === "refunded"
                              ? "sale"
                              : "default"
                        }
                      >
                        {PAYMENT_STATUS_LABELS[row.payment_status] || row.payment_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.notes || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No payment history yet — history is recorded when orders are placed
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
