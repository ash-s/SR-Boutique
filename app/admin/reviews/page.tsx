import { getAllReviews } from "@/lib/queries";
import { AdminReviewsClient } from "@/components/admin/AdminReviewsClient";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  return <AdminReviewsClient reviews={reviews} />;
}
