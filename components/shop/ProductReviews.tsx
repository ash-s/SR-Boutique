"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Review } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

interface ProductReviewsProps {
  productId: string;
  initialReviews: Review[];
  userId: string | null;
}

function StarRow({
  filled,
  size = "sm",
}: {
  filled: boolean;
  size?: "sm" | "md";
}) {
  return (
    <Star
      className={`${size === "md" ? "h-5 w-5" : "h-4 w-4"} ${
        filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
      }`}
    />
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="rounded p-0.5 transition hover:scale-110"
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={`h-7 w-7 ${
              star <= active ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId, initialReviews, userId }: ProductReviewsProps) {
  const supabase = createClient();
  const [reviews] = useState(initialReviews);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const starCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating]++;
    });
    return counts;
  }, [reviews]);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const filteredReviews = starFilter
    ? reviews.filter((r) => r.rating === starFilter)
    : reviews;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setReviewLoading(true);
    setReviewMessage("");

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: userId,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });

    if (error) {
      setReviewMessage(error.message.includes("unique") ? "You already reviewed this product." : error.message);
    } else {
      setReviewMessage("Review submitted! It will appear after admin approval.");
      setReviewForm({ rating: 5, comment: "" });
    }
    setReviewLoading(false);
  };

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>

      <div className="mt-6 grid gap-6 rounded-xl border bg-white p-5 lg:grid-cols-[240px_1fr]">
        <div>
          <div className="text-center lg:text-left">
            <p className="text-4xl font-bold text-gray-900">
              {totalReviews > 0 ? averageRating.toFixed(1) : "—"}
            </p>
            <div className="mt-1 flex justify-center gap-0.5 lg:justify-start">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarRow key={s} filled={s <= Math.round(averageRating)} size="md" />
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
          </div>

          <div className="mt-5 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star];
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              const isActive = starFilter === star;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarFilter(isActive ? null : star)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition ${
                    isActive ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-gray-50"
                  }`}
                >
                  <span className="w-8 text-left font-medium text-gray-700">{star} ★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-gray-500">{count}</span>
                </button>
              );
            })}
            {starFilter && (
              <button
                type="button"
                onClick={() => setStarFilter(null)}
                className="mt-1 text-xs text-brand-800 hover:underline"
              >
                Show all reviews
              </button>
            )}
          </div>
        </div>

        <div>
          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarRow key={s} filled={s <= review.rating} />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {(review.profiles as { full_name?: string })?.full_name || "Customer"}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-gray-500">
              {starFilter ? `No ${starFilter}-star reviews yet.` : "No reviews yet. Be the first!"}
            </p>
          )}
        </div>
      </div>

      {userId ? (
        <form onSubmit={handleSubmitReview} className="mt-6 max-w-lg space-y-4 rounded-xl border bg-white p-5">
          <h3 className="font-semibold text-gray-900">Write a Review</h3>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Your rating</label>
            <StarPicker
              value={reviewForm.rating}
              onChange={(rating) => setReviewForm({ ...reviewForm, rating })}
            />
            <p className="mt-1 text-xs text-gray-500">{reviewForm.rating} out of 5 stars</p>
          </div>
          <textarea
            placeholder="Share your experience with this product..."
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            rows={4}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {reviewMessage && (
            <p className={`text-sm ${reviewMessage.includes("submitted") ? "text-green-700" : "text-red-600"}`}>
              {reviewMessage}
            </p>
          )}
          <Button type="submit" disabled={reviewLoading}>
            {reviewLoading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          <Link href="/login" className="text-brand-800 hover:underline">Login</Link> to write a review.
        </p>
      )}
    </section>
  );
}
