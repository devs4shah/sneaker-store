"use client";

import { useState } from "react";
import type { SneakerImage as SneakerImageType } from "@/types/product";
import { SneakerImage } from "@/components/products/SneakerImage";
import { sortSneakerImages } from "@/lib/sneakerImages";

interface ImageGalleryProps {
  images: SneakerImageType[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const orderedImages = sortSneakerImages(images);
  const slides = orderedImages.length > 0 ? orderedImages : [{ id: "placeholder", imageUrl: "" }];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-zinc-800 dark:bg-zinc-800">
        <SneakerImage
          src={slides[activeIndex]?.imageUrl}
          alt={`${productName} — image ${activeIndex + 1}`}
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>

      {slides.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {slides.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                activeIndex === index
                  ? "border-brand-600 dark:border-brand-400"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${index + 1}`}
              aria-current={activeIndex === index}
            >
              <SneakerImage
                src={image.imageUrl}
                alt={`${productName} thumbnail ${index + 1}`}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
