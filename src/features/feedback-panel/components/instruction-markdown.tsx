"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { Check } from "lucide-react";
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

function SectionHeading({ children }: { children?: ReactNode }) {
  return <p className="mb-3 font-mono text-xs tracking-wide uppercase">{children}</p>;
}

function PlainListItem({ children }: { children?: ReactNode }) {
  return <li className="pl-1">{children}</li>;
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
      <nav className="mt-6 mb-4 flex gap-4 pb-1 font-mono text-[11px] tracking-wide uppercase">
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
        <div className="bg-sunken text-foreground mt-4 rounded-md text-sm leading-relaxed">
          {headedSections.map((section, index) => (
            <div key={section.heading} id={section.heading ? HEADED_SECTION_IDS[section.heading] : undefined} className={index > 0 ? "mt-6" : undefined}>
              {section.heading === "완료 기준" ? (
                <ChecklistSection markdown={section.markdown} />
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{ ...markdownProseComponents, h2: SectionHeading, li: PlainListItem }}
                >
                  {section.markdown}
                </ReactMarkdown>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * "완료 기준" 목록을 실제로 체크할 수 있는 자가 점검 리스트로 렌더링한다.
 * LLM이 GFM 태스크 문법(`- [ ] ...`)을 쓰면 remark-gfm이 비활성화된
 * <input type="checkbox">를 children에 끼워 넣는데, 그건 상호작용이 안 되므로
 * 걷어내고 우리가 관리하는 체크 상태로 항상 동일하게 렌더링한다.
 */
function ChecklistSection({ markdown }: { markdown: string }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  let nextIndex = 0;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        ...markdownProseComponents,
        h2: SectionHeading,
        li: ({ children }) => {
          const index = nextIndex++;
          const isChecked = checked[index] ?? false;
          const label = stripNativeCheckbox(children);

          return (
            <li>
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-start gap-2 text-left"
                aria-pressed={isChecked}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                    isChecked ? "bg-primary border-primary" : "border-line-strong",
                  )}
                  aria-hidden="true"
                >
                  {isChecked && <Check className="text-primary-foreground h-3 w-3" strokeWidth={3} />}
                </span>
                <span className={isChecked ? "text-faint line-through" : undefined}>{label}</span>
              </button>
            </li>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}

function stripNativeCheckbox(children: ReactNode) {
  return Children.toArray(children).filter((child) => !(isValidElement(child) && child.type === "input"));
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
