import { notFound } from "next/navigation";
import { getProductById, getApprovedReviews, getSimilarProducts } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product || !product.is_active) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const reviews = await getApprovedReviews(id);
  const similarProducts = await getSimilarProducts(id, product.category_id);

  return (
    <ProductDetailClient
      product={product}
      reviews={reviews}
      userId={user?.id ?? null}
      similarProducts={similarProducts}
    />
  );
}
