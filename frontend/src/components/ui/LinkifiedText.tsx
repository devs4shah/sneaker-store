import type { ReactNode } from "react";
import { parseLinkSegments } from "@/lib/linkifyText";

export { parseLinkSegments } from "@/lib/linkifyText";

export function linkifyText(text: string): ReactNode[] {
  return parseLinkSegments(text).map((segment, index) => {
    if (segment.type === "link" && segment.href) {
      return (
        <a
          key={`link-${index}`}
          href={segment.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-600 underline decoration-brand-600/40 underline-offset-2 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          {segment.value}
        </a>
      );
    }

    return <span key={`text-${index}`}>{segment.value}</span>;
  });
}

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  return <p className={className}>{linkifyText(text)}</p>;
}
