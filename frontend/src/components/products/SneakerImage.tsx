"use client";

import Image from "next/image";
import { useState } from "react";
import { isNextImageOptimizable, resolveImageUrl } from "@/lib/imageUrl";
import { PLACEHOLDER_SNEAKER_IMAGE } from "@/lib/imageUrl";

interface SneakerImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function SneakerImage({
  src,
  alt,
  className = "object-cover",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: SneakerImageProps) {
  const resolved = resolveImageUrl(src);
  const fillClassName = `absolute inset-0 h-full w-full ${className}`;
  const [imgErrorFallback, setImgErrorFallback] = useState(false);

  const effectiveSrc = imgErrorFallback ? PLACEHOLDER_SNEAKER_IMAGE : resolved;

  if (!isNextImageOptimizable(resolved)) {
    return (
      // External URLs (e.g. seed data) are not listed in next.config remotePatterns.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={effectiveSrc}
        alt={alt}
        className={fillClassName}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setImgErrorFallback(true)}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
