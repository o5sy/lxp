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
    <pre className="bg-sunken border-line mb-3 overflow-x-auto rounded-md border p-3 last:mb-0">{children}</pre>
  ),
};

function MarkdownHeading({ children }: { children?: ReactNode }) {
  return (
    <p className="border-line text-foreground mt-8 mb-3 border-t pt-4 font-mono text-xs tracking-wide uppercase first:mt-0 first:border-t-0 first:pt-0">
      {children}
    </p>
  );
}

export function MarkdownCode({
  className,
  children,
  background = "bg-sunken",
}: {
  className?: string;
  children?: ReactNode;
  /** 코드 칩 배경 토큰. 부모 컨테이너가 이미 bg-sunken이면(예: 지시문의 실습
   * 목표~완료 기준 구역) 다른 값으로 덮어써서 코드가 배경에 묻히지 않게 한다. */
  background?: string;
}) {
  const text = String(children).replace(/\n$/, "");
  const isBlock = className?.includes("language-") || text.includes("\n");

  if (isBlock) {
    return <code className="block font-mono text-xs">{text}</code>;
  }

  return <code className={cn(background, "rounded px-1 py-0.5 font-mono text-[0.85em]")}>{children}</code>;
}
