import type { Components } from "react-markdown";
import type { ReactNode } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/shared/lib/utils";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("text-foreground text-sm leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          ...markdownProseComponents,
          h1: MarkdownHeading,
          h2: MarkdownHeading,
          h3: MarkdownHeading,
          li: ({ children }) => <li className="pl-1">{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const markdownProseComponents: Partial<Components> = {
  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 ml-4 list-disc space-y-2 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 ml-4 list-decimal space-y-2 last:mb-0">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
      {children}
    </a>
  ),
  code: MarkdownCode,
  pre: ({ children }) => (
    <pre className="bg-primary/10 mb-3 overflow-x-auto rounded-md p-3 last:mb-0">{children}</pre>
  ),
};

function MarkdownHeading({ children }: { children?: ReactNode }) {
  return (
    <p className="border-line text-foreground mt-8 mb-3 border-t pt-4 font-mono text-xs tracking-wide uppercase first:mt-0 first:border-t-0 first:pt-0">
      {children}
    </p>
  );
}

export function MarkdownCode({ className, children }: { className?: string; children?: ReactNode }) {
  const text = String(children).replace(/\n$/, "");
  const isBlock = className?.includes("language-") || text.includes("\n");

  if (isBlock) {
    return <code className="text-primary block font-mono text-xs">{text}</code>;
  }

  return (
    <code className="bg-primary/10 text-primary rounded px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
  );
}
