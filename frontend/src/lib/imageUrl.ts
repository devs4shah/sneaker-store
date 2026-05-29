import { API_BASE_URL } from "@/lib/constants";

export const PLACEHOLDER_SNEAKER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%2327272a' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2371717a' font-family='system-ui' font-size='18'%3ENo image%3C/text%3E%3C/svg%3E";

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return PLACEHOLDER_SNEAKER_IMAGE;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${path}`;
}

/** True when `next/image` can load the URL via configured API remotePatterns. */
export function isNextImageOptimizable(url: string): boolean {
  if (url.startsWith("data:")) return false;

  try {
    const imageUrl = new URL(url, API_BASE_URL);
    const apiUrl = new URL(API_BASE_URL);
    return imageUrl.hostname === apiUrl.hostname && imageUrl.port === apiUrl.port;
  } catch {
    return false;
  }
}
