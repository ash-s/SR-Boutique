"use client";

import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { OrderStatus } from "@/lib/types";
import { CheckCircle2, Circle, Package, Truck, Home, Clock } from "lucide-react";

const TRACKING_STEPS: {
  status: OrderStatus;
  label: string;
  description: string;
  icon: typeof Package;
}[] = [
  {
    status: "pending",
    label: "Order Placed",
    description: "We received your order",
    icon: Clock,
  },
  {
    status: "confirmed",
    label: "Confirmed",
    description: "Seller has confirmed your order",
    icon: CheckCircle2,
  },
  {
    status: "shipped",
    label: "Out for Delivery",
    description: "Your order is on the way",
    icon: Truck,
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "Order delivered successfully",
    icon: Home,
  },
];

interface OrderTrackingTimelineProps {
  status: OrderStatus;
  createdAt: string;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
}

export function OrderTrackingTimeline({
  status,
  createdAt,
  trackingNumber,
  estimatedDelivery,
}: OrderTrackingTimelineProps) {
  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = TRACKING_STEPS.findIndex((s) => s.status === status);

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">Live Order Tracking</h3>
        {estimatedDelivery && status !== "delivered" && (
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
            Est. delivery: {formatDate(estimatedDelivery)}
          </span>
        )}
      </div>

      {trackingNumber && (
        <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm">
          <span className="text-gray-500">Tracking ID: </span>
          <span className="font-mono font-semibold text-brand-900">{trackingNumber}</span>
        </div>
      )}

      <div className="mt-6 space-y-0">
        {TRACKING_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
              {index < TRACKING_STEPS.length - 1 && (
                <div
                  className={`absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 ${
                    isCompleted && index < currentIndex ? "bg-brand-800" : "bg-gray-200"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  isCompleted
                    ? "bg-brand-900 text-white"
                    : "border-2 border-gray-300 bg-white text-gray-400"
                } ${isCurrent ? "ring-4 ring-brand-100" : ""}`}
              >
                {isCompleted ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={`text-sm font-semibold ${
                    isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {ORDER_STATUS_LABELS[step.status] || step.label}
                </p>
                <p className={`text-xs ${isCompleted ? "text-gray-600" : "text-gray-400"}`}>
                  {step.description}
                </p>
                {index === 0 && isCompleted && (
                  <p className="mt-1 text-xs text-gray-500">{formatDate(createdAt)}</p>
                )}
                {isCurrent && status !== "delivered" && (
                  <p className="mt-1 text-xs font-medium text-brand-800">In progress...</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {status === "delivered" && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          <Package className="h-4 w-4" />
          Your order has been delivered. Thank you for shopping!
        </div>
      )}
    </div>
  );
}
