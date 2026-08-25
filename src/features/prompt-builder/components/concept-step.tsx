"use client";

import { useMemo, useState } from "react";

import { CONCEPT_SUGGESTIONS } from "@/features/prompt-builder/lib/options";
import { cn } from "@/shared/lib/utils";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

const LISTBOX_ID = "concept-suggestions";

function optionId(index: number) {
  return `${LISTBOX_ID}-option-${index}`;
}

export function ConceptStep() {
  const concept = usePromptBuilderStore((state) => state.concept);
  const setConcept = usePromptBuilderStore((state) => state.setConcept);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(() => {
    const query = concept.trim().toLowerCase();
    if (!query) return [];
    return CONCEPT_SUGGESTIONS.filter(
      (item) => item.toLowerCase().includes(query) && item.toLowerCase() !== query,
    ).slice(0, 6);
  }, [concept]);

  const showSuggestions = isOpen && suggestions.length > 0;

  const selectSuggestion = (item: string) => {
    setConcept(item);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      if (suggestions.length === 0) return;
      event.preventDefault();
      if (!showSuggestions) {
        setIsOpen(true);
        setActiveIndex(0);
        return;
      }
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      if (suggestions.length === 0) return;
      event.preventDefault();
      if (!showSuggestions) {
        setIsOpen(true);
        setActiveIndex(suggestions.length - 1);
        return;
      }
      setActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      if (showSuggestions && activeIndex >= 0) {
        event.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
      }
    } else if (event.key === "Escape") {
      if (showSuggestions) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
  };

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
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={LISTBOX_ID}
            aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
            autoComplete="off"
            value={concept}
            onChange={(event) => {
              setConcept(event.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            onKeyDown={handleKeyDown}
            placeholder="배운 기술/개념을 짧게 입력하세요 (예: useEffect, 이벤트 버블링)"
            className="placeholder:text-faint w-full bg-transparent font-mono text-base outline-none"
          />
        </div>
        {showSuggestions && (
          <ul
            id={LISTBOX_ID}
            role="listbox"
            className="border-line bg-card absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-md border shadow-sm"
          >
            {suggestions.map((item, index) => {
              const active = index === activeIndex;
              return (
                <li key={item} id={optionId(index)} role="option" aria-selected={active}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "font-option text-foreground flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm",
                      active ? "bg-selection" : "hover:bg-selection",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-xs",
                        active ? "text-primary font-semibold" : "text-faint",
                      )}
                    >
                      {active ? ">" : index + 1}
                    </span>
                    {item}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
