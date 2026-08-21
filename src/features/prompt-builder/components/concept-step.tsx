"use client";

import { useMemo, useState } from "react";

import { CONCEPT_SUGGESTIONS } from "@/features/prompt-builder/lib/options";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export function ConceptStep() {
  const concept = usePromptBuilderStore((state) => state.concept);
  const setConcept = usePromptBuilderStore((state) => state.setConcept);
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = useMemo(() => {
    const query = concept.trim().toLowerCase();
    if (!query) return [];
    return CONCEPT_SUGGESTIONS.filter(
      (item) => item.toLowerCase().includes(query) && item.toLowerCase() !== query,
    ).slice(0, 6);
  }, [concept]);

  const showSuggestions = isFocused && suggestions.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-faint font-mono text-xs">concept</p>
      <h2 className="font-heading text-foreground text-[26px] italic">
        오늘 배운 개념을 골라주세요
      </h2>
      <p className="text-muted-foreground max-w-md text-sm">
        개념/기술명을 입력하면 자주 나오는 항목이 자동완성으로 제안됩니다. 목록에 없어도 직접
        입력해서 제출할 수 있어요.
      </p>
      <div className="relative">
        <div className="focus-within:border-primary border-line bg-sunken flex items-center gap-2.5 rounded-md border px-4.5 py-4">
          <span className="text-primary font-mono text-xl font-semibold">&gt;</span>
          <input
            type="text"
            value={concept}
            onChange={(event) => setConcept(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="배운 기술/개념을 짧게 입력하세요 (예: useEffect, 이벤트 버블링)"
            className="placeholder:text-faint w-full bg-transparent font-mono text-base outline-none"
          />
        </div>
        {showSuggestions && (
          <ul className="border-line bg-card absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-md border shadow-sm">
            {suggestions.map((item, index) => (
              <li key={item}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setConcept(item)}
                  className="font-option hover:bg-selection text-foreground flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm"
                >
                  <span className="text-faint font-mono text-xs">{index + 1}</span>
                  {item}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
