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
  header?: ReactNode;
  isStreaming?: boolean;
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

function PlainList({ children }: { children?: ReactNode }) {
  return <ul className="mb-4 space-y-2 last:mb-0">{children}</ul>;
}

/**
 * 완료 기준 체크박스와 같은 좌측 정렬선(마커 폭 + gap-2)을 쓰는 커스텀 불릿.
 * 브라우저 기본 list-disc 마커에 기대면 체크박스와 정확히 같은 줄에 맞추기
 * 어려워서, 두 리스트 모두 같은 flex 레이아웃으로 마커를 직접 그린다.
 */
function PlainListItem({ children }: { children?: ReactNode }) {
  return (
    <li className="flex list-none items-start gap-2">
      <span className="bg-faint mt-2 h-1 w-1 shrink-0 rounded-full" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export function InstructionMarkdown({ content, header, isStreaming }: InstructionMarkdownProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(OVERVIEW_ID);

  const sections = splitSections(content);
  const overview = sections.find((section) => section.heading === null);
  const headedSections = sections.filter((section) => section.heading !== null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    // 스트리밍 중에는 헤딩이 계속 새로 생기고 문서 높이가 계속 바뀌어서
    // 활성 섹션 판정이 매 델타마다 흔들린다 — 레일 표시가 눈에 띄게
    // 튀는 걸 막기 위해 스트리밍이 끝날 때까지는 갱신을 건너뛴다.
    if (isStreaming) return;

    const targets = [OVERVIEW_ID, ...Object.values(HEADED_SECTION_IDS)]
      .map((id) => container.querySelector<HTMLElement>(`#${id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    // "상단 기준선을 지나친 섹션 중 마지막 것"을 활성으로 고른다. 단, 마지막
    // 섹션 자체의 콘텐츠가 컨테이너보다 짧으면 아무리 끝까지 스크롤해도 그
    // 섹션이 기준선까지 올라오지 못해 영원히 활성화되지 않는 문제가 있다 —
    // 그래서 스크롤이 바닥에 닿았을 때는 항상 마지막 섹션을 강제로 활성 처리
    // 한다(표준 scrollspy 패턴).
    const TOP_THRESHOLD_PX = 24;

    const updateActiveSection = () => {
      const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
      if (atBottom) {
        setActiveId(targets[targets.length - 1].id);
        return;
      }

      const containerTop = container.getBoundingClientRect().top;
      let current = targets[0];
      for (const target of targets) {
        if (target.getBoundingClientRect().top - containerTop <= TOP_THRESHOLD_PX) {
          current = target;
        }
      }
      setActiveId(current.id);
    };

    updateActiveSection();
    container.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => container.removeEventListener("scroll", updateActiveSection);
  }, [content, isStreaming]);

  const scrollToSection = (id: string) => {
    scrollRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="bg-background shrink-0 px-6 pt-6">
        {header}
        <nav className="mt-6 flex gap-4 font-mono text-[11px] tracking-wide uppercase">
          <SectionRailLink id={OVERVIEW_ID} label="개요" activeId={activeId} onClick={scrollToSection} />
          {Object.entries(HEADED_SECTION_IDS).map(([label, id]) => (
            <SectionRailLink key={id} id={id} label={label} activeId={activeId} onClick={scrollToSection} />
          ))}
        </nav>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {overview?.markdown.trim() && (
          <div id={OVERVIEW_ID} className="text-foreground scroll-mt-6 px-6 pt-2 pb-4 text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownProseComponents}>
              {overview.markdown}
            </ReactMarkdown>
          </div>
        )}

        {headedSections.length > 0 && (
          <div className="bg-sunken text-foreground px-6 py-6 text-sm leading-relaxed">
            {headedSections.map((section, index) => (
              <div
                key={section.heading}
                id={section.heading ? HEADED_SECTION_IDS[section.heading] : undefined}
                className={cn("scroll-mt-6", index > 0 && "mt-6")}
              >
                {section.heading === "완료 기준" ? (
                  <ChecklistSection markdown={section.markdown} />
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{ ...markdownProseComponents, h2: SectionHeading, ul: PlainList, li: PlainListItem }}
                  >
                    {section.markdown}
                  </ReactMarkdown>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
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
        ul: PlainList,
        li: ({ children }) => {
          const index = nextIndex++;
          const isChecked = checked[index] ?? false;
          const label = stripNativeCheckbox(children);

          return (
            <li className="list-none">
              <button
                type="button"
                onClick={() => toggle(index)}
                className="group flex w-full items-start gap-2 text-left"
                aria-pressed={isChecked}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors",
                    isChecked ? "bg-primary border-primary" : "bg-background border-line-strong group-hover:border-primary",
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
