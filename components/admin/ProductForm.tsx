"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Category, Product } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { BRANDS, MATERIALS } from "@/lib/constants";
import { formatSupabaseError, isUserAdmin } from "@/lib/profile-utils";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ProductFormProps {
  categories: Category[];
  product?: Product & { product_images?: { id: string; image_url: string; sort_order: number }[] };
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(
    product?.product_images || []
  );

  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    sale_price: product?.sale_price?.toString() || "",
    category_id: product?.category_id || "",
    subcategory_id: product?.subcategory_id || "",
    brand: product?.brand || "SR Boutique",
    material: product?.material || "Cotton",
    sizes: product?.sizes?.join(", ") || "S, M, L, XL",
    colors: product?.colors?.join(", ") || "Black, White",
    stock: product?.stock?.toString() || "10",
    is_active: product?.is_active ?? true,
  });

  const mainCategories = categories.filter((c) => !c.parent_id);
  const selectedMain = mainCategories.find((c) => c.id === form.category_id);
  const dbSubOptions = selectedMain
    ? categories.filter((c) => c.parent_id === selectedMain.id)
    : [];
  const subOptions = dbSubOptions;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    await supabase.from("product_images").delete().eq("id", imageId);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const uploadImages = async (productId: string) => {
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const ext = file.name.split(".").pop();
      const path = `${productId}/${Date.now()}-${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      await supabase.from("product_images").insert({
        product_id: productId,
        image_url: publicUrl,
        sort_order: existingImages.length + i,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const admin = await isUserAdmin(supabase);
      if (!admin) {
        throw new Error(
          "You are not an admin. Run the SQL fix in Supabase and set your account role to admin (see yellow banner above)."
        );
      }

      const productData = {
        name: form.name,
        slug: slugify(form.name) + "-" + Date.now().toString(36),
        description: form.description,
        price: parseFloat(form.price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        category_id: form.category_id || null,
        subcategory_id: form.subcategory_id || null,
        brand: form.brand || null,
        material: form.material || null,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
        stock: parseInt(form.stock) || 0,
        is_active: form.is_active,
      };

      if (product) {
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (updateError) throw updateError;

        if (images.length > 0) {
          await uploadImages(product.id);
        }

        router.push("/admin/products");
        router.refresh();
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (insertError) throw insertError;

        if (images.length > 0) {
          await uploadImages(newProduct.id);
        }

        router.push("/admin/products");
        router.refresh();
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError(formatSupabaseError(err as { message?: string; code?: string }));
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <Input
        label="Product Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Price (₹)"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <Input
          label="Sale Price (₹) — optional"
          type="number"
          min="0"
          step="0.01"
          value={form.sale_price}
          onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
        />
      </div>

      <Select
        label="Main Category"
        options={[
          { value: "", label: "Select category" },
          ...mainCategories.map((c) => ({ value: c.id, label: c.name })),
        ]}
        value={form.category_id}
        onChange={(e) => setForm({ ...form, category_id: e.target.value, subcategory_id: "" })}
      />

      {subOptions.length > 0 ? (
        <Select
          label="Sub Category (Type)"
          options={[
            { value: "", label: "Select type e.g. Shirt, T-Shirt" },
            ...subOptions.map((c) => ({ value: c.id, label: c.name })),
          ]}
          value={form.subcategory_id}
          onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })}
        />
      ) : form.category_id ? (
        <p className="text-sm text-amber-700">
          No subcategories found. Run migration 007 in Supabase or add subcategories in Admin → Categories.
        </p>
      ) : null}
      <p className="-mt-2 text-sm text-gray-500">
        Need a new category?{" "}
        <Link href="/admin/categories" className="font-medium text-brand-900 hover:underline">
          Add category here
        </Link>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Brand"
          options={BRANDS.map((b) => ({ value: b, label: b }))}
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
        />
        <Select
          label="Material"
          options={MATERIALS.map((m) => ({ value: m, label: m }))}
          value={form.material}
          onChange={(e) => setForm({ ...form, material: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Sizes (comma separated)"
          value={form.sizes}
          onChange={(e) => setForm({ ...form, sizes: e.target.value })}
        />
        <Input
          label="Colors (comma separated)"
          value={form.colors}
          onChange={(e) => setForm({ ...form, colors: e.target.value })}
        />
      </div>

      <Input
        label="Stock"
        type="number"
        min="0"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="rounded border-gray-300"
        />
        <span className="text-sm">Active (visible in store)</span>
      </label>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Product Images
        </label>
        <div className="flex flex-wrap gap-3">
          {existingImages.map((img) => (
            <div key={img.id} className="relative h-24 w-24">
              <Image
                src={img.image_url}
                alt=""
                fill
                className="rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => removeExistingImage(img.id)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.map((file, i) => (
            <div key={i} className="relative h-24 w-24">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-full w-full rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => removeNewImage(i)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 hover:border-brand-600">
            <Upload className="h-6 w-6 text-gray-400" />
            <span className="mt-1 text-xs text-gray-500">Upload</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
