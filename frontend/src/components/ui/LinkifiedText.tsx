import type { ReactNode } from "react";

const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;

function trimTrailingPunctuation(url: string): string {
  return url.replace(/[.,;:!?)]+$/, "");
}

export function linkifyText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const rawUrl = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    const href = trimTrailingPunctuation(rawUrl);
    const trailing = rawUrl.slice(href.length);

    nodes.push(
      <a
        key={`link-${start}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-brand-600 underline decoration-brand-600/40 underline-offset-2 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
      >
        {href}
      </a>,
    );

    if (trailing) {
      nodes.push(trailing);
    }

    lastIndex = start + rawUrl.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  return <p className={className}>{linkifyText(text)}</p>;
}
