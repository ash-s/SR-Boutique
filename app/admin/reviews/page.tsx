import { getAllReviews, getAllProductsAdmin } from "@/lib/queries";
import { AdminReviewsClient } from "@/components/admin/AdminReviewsClient";

export default async function AdminReviewsPage() {
  const [reviews, products] = await Promise.all([
    getAllReviews(),
    getAllProductsAdmin(),
  ]);

  return (
    <AdminReviewsClient
      reviews={reviews}
      products={products.map((p) => ({ id: p.id, name: p.name }))}
    />
  );
}
