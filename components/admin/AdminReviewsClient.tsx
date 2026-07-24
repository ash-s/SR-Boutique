"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Star } from "lucide-react";

interface ReviewRow {
  id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  profiles?: { full_name?: string } | null;
  products?: { id?: string; name?: string } | null;
}

interface ProductOption {
  id: string;
  name: string;
}

export function AdminReviewsClient({
  reviews: initialReviews,
  products,
}: {
  reviews: ReviewRow[];
  products: ProductOption[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedProductId, setSelectedProductId] = useState<string | "all">("all");
  const [starFilter, setStarFilter] = useState<number | "all">("all");
  const supabase = createClient();

  const productStats = useMemo(() => {
    const stats: Record<string, { total: number; pending: number }> = {};
    reviews.forEach((r) => {
      if (!stats[r.product_id]) stats[r.product_id] = { total: 0, pending: 0 };
      stats[r.product_id].total++;
      if (!r.is_approved) stats[r.product_id].pending++;
    });
    return stats;
  }, [reviews]);

  const productsWithReviews = useMemo(() => {
    const ids = new Set(reviews.map((r) => r.product_id));
    return products.filter((p) => ids.has(p.id));
  }, [products, reviews]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (selectedProductId !== "all" && r.product_id !== selectedProductId) return false;
      if (starFilter !== "all" && r.rating !== starFilter) return false;
      return true;
    });
  }, [reviews, selectedProductId, starFilter]);

  const toggleApproval = async (id: string, approve: boolean) => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: approve })
      .eq("id", id);

    if (!error) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: approve } : r))
      );
    }
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
      <p className="text-sm text-gray-500">
        {reviews.length} total · {reviews.filter((r) => !r.is_approved).length} pending approval
      </p>

      {/* Star filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStarFilter("all")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            starFilter === "all"
              ? "bg-brand-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Stars
        </button>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.filter(
            (r) =>
              r.rating === star &&
              (selectedProductId === "all" || r.product_id === selectedProductId)
          ).length;
          return (
            <button
              key={star}
              type="button"
              onClick={() => setStarFilter(starFilter === star ? "all" : star)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                starFilter === star
                  ? "bg-yellow-400 text-gray-900"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {star} <Star className="h-3.5 w-3.5 fill-current" /> ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Product list */}
        <aside className="rounded-xl border bg-white p-3">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Filter by Product
          </p>
          <button
            type="button"
            onClick={() => setSelectedProductId("all")}
            className={`mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
              selectedProductId === "all"
                ? "bg-brand-50 font-medium text-brand-900"
                : "hover:bg-gray-50"
            }`}
          >
            <span>All Products</span>
            <span className="text-xs text-gray-500">{reviews.length}</span>
          </button>
          <div className="mt-1 max-h-[480px] space-y-0.5 overflow-y-auto">
            {productsWithReviews.map((product) => {
              const stats = productStats[product.id];
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProductId(product.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    selectedProductId === product.id
                      ? "bg-brand-50 font-medium text-brand-900"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className="line-clamp-2 pr-2">{product.name}</span>
                  <span className="flex-shrink-0 text-xs text-gray-500">
                    {stats?.total || 0}
                    {stats?.pending ? (
                      <span className="ml-1 text-amber-600">({stats.pending} new)</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
            {productsWithReviews.length === 0 && (
              <p className="px-3 py-4 text-sm text-gray-500">No product reviews yet</p>
            )}
          </div>
        </aside>

        {/* Review list */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Showing {filtered.length} review{filtered.length !== 1 ? "s" : ""}
            {selectedProductId !== "all" &&
              ` for ${products.find((p) => p.id === selectedProductId)?.name}`}
            {starFilter !== "all" && ` · ${starFilter} stars`}
          </p>

          {filtered.length > 0 ? (
            filtered.map((review) => (
              <div key={review.id} className="rounded-lg border bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{review.products?.name || "Product"}</p>
                    <p className="text-sm text-gray-500">
                      by {review.profiles?.full_name || "Customer"} — {formatDate(review.created_at)}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm text-gray-600">{review.rating}/5</span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                    )}
                  </div>
                  <Badge variant={review.is_approved ? "success" : "warning"}>
                    {review.is_approved ? "Approved" : "Pending"}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  {!review.is_approved && (
                    <Button size="sm" onClick={() => toggleApproval(review.id, true)}>
                      Approve
                    </Button>
                  )}
                  {review.is_approved && (
                    <Button size="sm" variant="outline" onClick={() => toggleApproval(review.id, false)}>
                      Hide
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => deleteReview(review.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-lg border bg-white py-12 text-center text-gray-500">
              No reviews match this filter
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
