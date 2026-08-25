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
          h1: MarkdownHeading,
          h2: MarkdownHeading,
          h3: MarkdownHeading,
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
              {children}
            </a>
          ),
          code: MarkdownCode,
          pre: ({ children }) => (
            <pre className="bg-sunken border-line mb-3 overflow-x-auto rounded-md border p-3 last:mb-0">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function MarkdownHeading({ children }: { children?: ReactNode }) {
  return <p className="text-foreground mt-4 mb-1.5 font-mono text-xs tracking-wide uppercase first:mt-0">{children}</p>;
}

function MarkdownCode({ className, children }: { className?: string; children?: ReactNode }) {
  const text = String(children).replace(/\n$/, "");
  const isBlock = className?.includes("language-") || text.includes("\n");

  if (isBlock) {
    return <code className="block font-mono text-xs">{text}</code>;
  }

  return <code className="bg-sunken rounded px-1 py-0.5 font-mono text-[0.85em]">{children}</code>;
}
