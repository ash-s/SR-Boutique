"use client";

import Link from "next/link";
import { MAIN_CATEGORIES, CATEGORY_IMAGES } from "@/lib/constants";
import { Category } from "@/lib/types";
import { ProductImage } from "@/components/shop/ProductImage";

interface CategoryTilesProps {
  categories: Category[];
}

export function CategoryTiles({ categories }: CategoryTilesProps) {
  const mains = MAIN_CATEGORIES.map((mc) => {
    const db = categories.find((c) => c.slug === mc.slug && !c.parent_id);
    return { ...mc, id: db?.id || mc.slug, image_url: db?.image_url || CATEGORY_IMAGES[mc.slug] };
  });

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {mains.map((cat) => (
        <Link
          key={cat.slug}
          href={`/shop/${cat.slug}`}
          className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br from-brand-200 to-brand-400 shadow-sm transition-shadow hover:shadow-lg"
        >
          <ProductImage
            src={cat.image_url}
            alt={cat.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <span className="text-lg font-semibold text-white">{cat.name}</span>
            <p className="text-xs text-white/80">Shop now →</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
