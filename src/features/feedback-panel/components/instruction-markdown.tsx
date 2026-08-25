"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { markdownProseComponents } from "@/shared/ui/markdown-content";
import { cn } from "@/shared/lib/utils";

type InstructionMarkdownProps = {
  content: string;
};

type Section = {
  /** null for the intro paragraphs before the first "## " heading (개요) */
  heading: string | null;
  markdown: string;
};

const OVERVIEW_ID = "instruction-section-overview";
const HEADED_SECTION_IDS: Record<string, string> = {
  "실습 목표": "instruction-section-goal",
  "요구 사항": "instruction-section-requirements",
  "완료 기준": "instruction-section-criteria",
};

function splitSections(content: string): Section[] {
  const lines = content.split("\n");
  const sections: Section[] = [{ heading: null, markdown: "" }];

  for (const line of lines) {
    const match = /^##\s+(.*)/.exec(line);
    if (match) {
      sections.push({ heading: match[1].trim(), markdown: line });
    } else {
      const last = sections[sections.length - 1];
      last.markdown = last.markdown ? `${last.markdown}\n${line}` : line;
    }
  }

  return sections;
}

export function InstructionMarkdown({ content }: InstructionMarkdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(OVERVIEW_ID);

  const sections = splitSections(content);
  const overview = sections.find((section) => section.heading === null);
  const headedSections = sections.filter((section) => section.heading !== null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = [OVERVIEW_ID, ...Object.values(HEADED_SECTION_IDS)]
      .map((id) => container.querySelector<HTMLElement>(`#${id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) => (a.boundingClientRect.top <= b.boundingClientRect.top ? a : b));
        setActiveId(topmost.target.id);
      },
      { root: container, rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [content]);

  const scrollToSection = (id: string) => {
    containerRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={containerRef}>
      <nav className="border-line mb-4 flex gap-4 border-b pb-3 font-mono text-[11px] tracking-wide uppercase">
        <SectionRailLink id={OVERVIEW_ID} label="개요" activeId={activeId} onClick={scrollToSection} />
        {Object.entries(HEADED_SECTION_IDS).map(([label, id]) => (
          <SectionRailLink key={id} id={id} label={label} activeId={activeId} onClick={scrollToSection} />
        ))}
      </nav>

      {overview?.markdown.trim() && (
        <div id={OVERVIEW_ID} className="text-foreground text-sm leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownProseComponents}>
            {overview.markdown}
          </ReactMarkdown>
        </div>
      )}

      {headedSections.length > 0 && (
        <div className="bg-sunken text-foreground mt-4 rounded-md p-4 text-sm leading-relaxed">
          {headedSections.map((section, index) => (
            <div key={section.heading} id={section.heading ? HEADED_SECTION_IDS[section.heading] : undefined} className={index > 0 ? "mt-6" : undefined}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ...markdownProseComponents,
                  h2: ({ children }) => <p className="mb-3 font-mono text-xs tracking-wide uppercase">{children}</p>,
                  li: section.heading === "완료 기준" ? ChecklistItem : ({ children }) => <li className="pl-1">{children}</li>,
                }}
              >
                {section.markdown}
              </ReactMarkdown>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * "완료 기준" 리스트를 체크리스트처럼 보이게 한다. LLM이 실제 GFM 태스크
 * 문법(`- [ ] ...`)을 쓰면 remark-gfm이 <input type="checkbox">를 children에
 * 끼워 넣는데, 이때는 네이티브 입력을 그대로 스타일링하고 장식용 박스를
 * 더하지 않는다 — 두 개의 체크박스가 겹쳐 보이는 걸 막기 위함.
 */
function ChecklistItem({ children }: { children?: ReactNode }) {
  const hasNativeCheckbox = Children.toArray(children).some(
    (child) => isValidElement(child) && child.type === "input",
  );

  if (hasNativeCheckbox) {
    return (
      <li className="[&_input]:border-line-strong [&_input]:checked:bg-primary [&_input]:checked:border-primary flex list-none items-start gap-2 [&_input]:mt-0.5 [&_input]:h-3.5 [&_input]:w-3.5 [&_input]:shrink-0 [&_input]:appearance-none [&_input]:rounded-[3px] [&_input]:border">
        {children}
      </li>
    );
  }

  return (
    <li className="flex list-none items-start gap-2">
      <span className="border-line-strong mt-0.5 h-3.5 w-3.5 shrink-0 rounded-[3px] border" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

function SectionRailLink({
  id,
  label,
  activeId,
  onClick,
}: {
  id: string;
  label: string;
  activeId: string;
  onClick: (id: string) => void;
}) {
  const active = activeId === id;
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cn(
        "border-b-2 pb-2",
        active ? "text-primary border-primary" : "text-faint hover:text-muted-foreground border-transparent",
      )}
    >
      {label}
    </button>
  );
}
