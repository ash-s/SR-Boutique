"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Star } from "lucide-react";

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  profiles?: { full_name?: string } | null;
  products?: { name?: string } | null;
}

export function AdminReviewsClient({ reviews: initialReviews }: { reviews: ReviewRow[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const supabase = createClient();

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
      <p className="text-sm text-gray-500">Approve or hide customer reviews</p>

      <div className="mt-6 space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{review.products?.name || "Product"}</p>
                  <p className="text-sm text-gray-500">
                    by {review.profiles?.full_name || "Customer"} — {formatDate(review.created_at)}
                  </p>
                  <div className="mt-1 flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  {review.comment && <p className="mt-2 text-sm text-gray-600">{review.comment}</p>}
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
          <p className="py-8 text-center text-gray-500">No reviews yet</p>
        )}
      </div>
    </div>
  );
}
