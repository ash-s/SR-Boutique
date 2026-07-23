"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Category } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { formatSupabaseError, isUserAdmin } from "@/lib/profile-utils";
import { Pencil, Trash2, Plus, FolderOpen } from "lucide-react";

interface CategoriesClientProps {
  categories: Category[];
}

export function CategoriesClient({ categories: initial }: CategoriesClientProps) {
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    const admin = await isUserAdmin(supabase);
    if (!admin) {
      setLoading(false);
      setError("You are not an admin. Run the SQL fix in Supabase (see yellow banner above).");
      return;
    }

    const slug = slugify(name) + "-" + Date.now().toString(36).slice(-4);
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), slug })
      .select()
      .single();

    setLoading(false);
    if (error) {
      setError(formatSupabaseError(error));
    } else if (data) {
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      router.refresh();
    }
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from("categories")
      .update({ name: editName.trim() })
      .eq("id", id);

    setLoading(false);
    if (!error) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: editName.trim() } : c))
      );
      setEditingId(null);
      router.refresh();
    } else {
      setError(formatSupabaseError(error));
    }
  };

  const deleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"? Products in this category will be uncategorized.`)) {
      return;
    }
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } else {
      setError(formatSupabaseError(error));
    }
  };

  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900">
          <Plus className="h-5 w-5" /> Add New Category
        </h2>
        <form onSubmit={addCategory} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="e.g. Sarees, T-Shirts, Accessories"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 flex-1"
          />
          <Button type="submit" className="h-11 sm:w-auto" disabled={loading}>
            {loading ? "Adding..." : "Add Category"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b bg-gray-50 px-4 py-3">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <FolderOpen className="h-5 w-5" /> All Categories ({categories.length})
          </h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <li key={cat.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              {editingId === cat.id ? (
                <div className="flex flex-1 gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-10"
                  />
                  <Button size="sm" onClick={() => saveEdit(cat.id)} disabled={loading}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-500">/{cat.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                      }}
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="gap-1"
                      onClick={() => deleteCategory(cat.id, cat.name)}
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
