export interface LinkSegment {
  type: "text" | "link";
  value: string;
  href?: string;
}

const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;

function trimTrailingPunctuation(url: string): string {
  return url.replace(/[.,;:!?)]+$/, "");
}

export function parseLinkSegments(text: string): LinkSegment[] {
  const segments: LinkSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const rawUrl = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, start) });
    }

    const href = trimTrailingPunctuation(rawUrl);
    const trailing = rawUrl.slice(href.length);

    segments.push({ type: "link", value: href, href });

    if (trailing) {
      segments.push({ type: "text", value: trailing });
    }

    lastIndex = start + rawUrl.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: "text", value: text });
  }

  return segments;
}
