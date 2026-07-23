import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getProductById } from "@/lib/queries";
import { ProductForm } from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-brand-800 hover:underline">
        ← Back to Products
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Edit Product</h1>
      <p className="text-sm text-gray-500">{product.name}</p>
      <div className="mt-6">
        <ProductForm categories={categories} product={product} />
      </div>
    </div>
  );
}
