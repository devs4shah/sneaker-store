import type { SneakerImage } from "@/types/product";

export function sortSneakerImages(images: SneakerImage[]): SneakerImage[] {
  return [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export function getPrimarySneakerImage(images: SneakerImage[]): SneakerImage | undefined {
  return sortSneakerImages(images)[0];
}
