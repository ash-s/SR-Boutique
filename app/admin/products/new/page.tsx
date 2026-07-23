import Link from "next/link";
import { getCategories } from "@/lib/queries";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-brand-800 hover:underline">
        ← Back to Products
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Add New Product</h1>
      <p className="text-sm text-gray-500">Upload images and set product details</p>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
