"use client";

import { useState } from "react";
import { cn, normalizeImageUrl } from "@/lib/utils";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const normalized = normalizeImageUrl(src);

  if (!normalized || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 text-xs text-gray-400 sm:text-sm",
          fill && "absolute inset-0",
          className
        )}
      >
        No Image
      </div>
    );
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={normalized}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={normalized}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
