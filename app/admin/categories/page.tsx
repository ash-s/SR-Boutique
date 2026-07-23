import { getCategories } from "@/lib/queries";
import { CategoriesClient } from "@/components/admin/CategoriesClient";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-brand-800 hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">
            Organize products by Women, Men, Kids, Ethnic, Western, Sale — or add your own
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      <div className="mt-6">
        <CategoriesClient categories={categories} />
      </div>
    </div>
  );
}
