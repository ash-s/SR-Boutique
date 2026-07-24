"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SIZES, COLORS, MATERIALS, BRANDS, SUBCATEGORIES } from "@/lib/constants";
import { Category } from "@/lib/types";
import { SlidersHorizontal } from "lucide-react";

interface FilterSidebarProps {
  categories: Category[];
  mainCategory?: string;
  subcategories?: Category[];
  mobile?: boolean;
  onClose?: () => void;
}

export function FilterSidebar({
  categories,
  mainCategory,
  subcategories = [],
  mobile,
  onClose,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getParam = (key: string) => searchParams?.get(key) || "";

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.push(`${pathname}?${params.toString()}`);
      onClose?.();
    },
    [router, pathname, searchParams, onClose]
  );

  const clearFilters = () => {
    router.push(pathname || "/shop");
    onClose?.();
  };

  const subs = subcategories.length > 0
    ? subcategories
    : (mainCategory ? (SUBCATEGORIES[mainCategory] || []).map((s) => ({ id: s.slug, name: s.name, slug: s.slug })) : []);

  return (
    <div className={mobile ? "p-4" : "space-y-6"}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </h3>
        <button type="button" onClick={clearFilters} className="text-xs text-brand-800 hover:underline">
          Clear all
        </button>
      </div>

      <Select
        label="Sort by"
        options={[
          { value: "", label: "Newest" },
          { value: "price_asc", label: "Price: Low to High" },
          { value: "price_desc", label: "Price: High to Low" },
        ]}
        value={getParam("sort")}
        onChange={(e) => updateFilters({ sort: e.target.value })}
      />

      {subs.length > 0 && (
        <Select
          label="Type"
          options={[
            { value: "", label: "All types" },
            ...subs.map((s) => ({ value: s.slug, label: s.name })),
          ]}
          value={getParam("subcategory")}
          onChange={(e) => updateFilters({ subcategory: e.target.value })}
        />
      )}

      {!mainCategory && (
        <Select
          label="Category"
          options={[
            { value: "", label: "All" },
            ...categories.filter((c) => !c.parent_id).map((c) => ({ value: c.slug, label: c.name })),
          ]}
          value={getParam("category")}
          onChange={(e) => updateFilters({ category: e.target.value })}
        />
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Price Range (₹)</label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={getParam("minPrice")}
            onChange={(e) => updateFilters({ minPrice: e.target.value })}
            className="h-10"
          />
          <Input
            type="number"
            placeholder="Max"
            value={getParam("maxPrice")}
            onChange={(e) => updateFilters({ maxPrice: e.target.value })}
            className="h-10"
          />
        </div>
      </div>

      <Select
        label="Size"
        options={[{ value: "", label: "Any" }, ...SIZES.map((s) => ({ value: s, label: s }))]}
        value={getParam("size")}
        onChange={(e) => updateFilters({ size: e.target.value })}
      />

      <Select
        label="Color"
        options={[{ value: "", label: "Any" }, ...COLORS.map((c) => ({ value: c, label: c }))]}
        value={getParam("color")}
        onChange={(e) => updateFilters({ color: e.target.value })}
      />

      <Select
        label="Brand"
        options={[{ value: "", label: "Any" }, ...BRANDS.map((b) => ({ value: b, label: b }))]}
        value={getParam("brand")}
        onChange={(e) => updateFilters({ brand: e.target.value })}
      />

      <Select
        label="Material"
        options={[{ value: "", label: "Any" }, ...MATERIALS.map((m) => ({ value: m, label: m }))]}
        value={getParam("material")}
        onChange={(e) => updateFilters({ material: e.target.value })}
      />

      {mobile && (
        <Button className="w-full" onClick={onClose}>
          Apply Filters
        </Button>
      )}
    </div>
  );
}
