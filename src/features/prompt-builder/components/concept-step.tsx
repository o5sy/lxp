"use client";

import { useMemo, useRef, useState } from "react";

import { CONCEPT_SUGGESTIONS } from "@/features/prompt-builder/lib/options";
import { cn } from "@/shared/lib/utils";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

const LISTBOX_ID = "concept-suggestions";

function optionId(index: number) {
  return `${LISTBOX_ID}-option-${index}`;
}

function findPrefixMatch(query: string) {
  return CONCEPT_SUGGESTIONS.find(
    (item) => item.toLowerCase().startsWith(query) && item.toLowerCase() !== query,
  );
}

export function ConceptStep() {
  const concept = usePromptBuilderStore((state) => state.concept);
  const setConcept = usePromptBuilderStore((state) => state.setConcept);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // 인라인 자동완성(ghost)이 현재 화면에 보이는지 - 선택 영역 스타일링에 쓴다.
  const [isGhostShown, setIsGhostShown] = useState(false);
  // 인라인 제안이 떠 있는 동안, concept 앞에서부터 실제로 타이핑한 글자 수.
  // null이면 지금 concept 전체가 곧 타이핑한 내용이라는 뜻(제안이 없거나
  // 이미 확정됨). 드롭다운은 이 "실제로 타이핑한 부분"만으로 검색해야
  // 확장된 전체 문자열이 아니라 사용자가 친 글자 기준으로 매칭된다.
  const [typedLength, setTypedLength] = useState<number | null>(null);

  // 백스페이스/Delete/Esc로 인라인 제안을 지운 직후에는, 같은 접두어로 곧바로
  // 다시 채워 넣지 않도록 잠깐 억제한다. 새 글자를 입력하면 다시 활성화된다.
  // keydown -> input 이벤트가 같은 틱에서 연달아 발생하므로 리렌더를 기다리지
  // 않고 즉시 반영돼야 해서 상태 대신 ref로 관리한다.
  const suppressGhostRef = useRef(false);
  // 한글 등 IME 조합 중에는 절대 개입하면 안 된다 - 조합 중인 글자 위로 우리가
  // input.value를 강제로 덮어쓰면 IME가 조합 상태를 잃고 글자가 깨지거나
  // 사라진다 (예: "버블링" 입력 중 "블"이 통째로 날아가는 문제). 조합이 끝난
  // 뒤의 입력에만 인라인 제안을 적용한다.
  const isComposingRef = useRef(false);

  const typedText = typedLength === null ? concept : concept.slice(0, typedLength);
  const query = typedText.trim().toLowerCase();

  // 드롭다운은 인라인 제안과 별개로, 실제로 타이핑한 부분 기준으로 항상 보여준다.
  // 인라인 제안과 겹치는 항목은 중복으로 보이지 않도록 제외한다.
  const suggestions = useMemo(() => {
    if (!query) return [];
    const ghostMatch = findPrefixMatch(query);
    return CONCEPT_SUGGESTIONS.filter(
      (item) =>
        item.toLowerCase().includes(query) && item.toLowerCase() !== query && item !== ghostMatch,
    ).slice(0, 6);
  }, [query]);

  const showSuggestions = isOpen && suggestions.length > 0;

  const selectSuggestion = (item: string) => {
    setConcept(item);
    setActiveIndex(-1);
    setIsGhostShown(false);
    setTypedLength(null);
  };

  // 아직 확정하지 않은(선택된) 인라인 제안을 거절하고, 실제로 타이핑한
  // 부분까지만 남긴다. Esc뿐 아니라 포커스 아웃(다른 곳 클릭 등)도 같은
  // "확정 안 함" 의사로 취급한다 - 그냥 두면 제안이 그대로 값으로 굳어버린다.
  const rejectGhost = (input: HTMLInputElement) => {
    const typedUpTo = input.selectionStart ?? input.value.length;
    suppressGhostRef.current = true;
    setConcept(input.value.slice(0, typedUpTo));
    setIsGhostShown(false);
    setTypedLength(null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const rawValue = input.value;
    // 여기서는 trim하지 않는다 - 방금 입력한 공백이 후보 단어 자체의 띄어쓰기
    // 위치와 일치하지 않으면(예: "이" 뒤에 공백) startsWith가 자연히 실패해
    // 제안이 사라진다. trim해서 비교하면 그 공백을 무시한 채 같은 후보를
    // 다시 붙여버려서, 사용자가 입력한 공백이 통째로 삼켜지는 문제가 있었다.
    const rawQuery = rawValue.toLowerCase();
    const match =
      !isComposingRef.current && !suppressGhostRef.current && rawQuery.trim()
        ? findPrefixMatch(rawQuery)
        : undefined;

    if (match) {
      // 타이핑한 부분(rawValue) 뒤를 매칭된 단어 전체로 채우고, 아직 타이핑하지
      // 않은 나머지를 실제 텍스트 선택 영역으로 만든다. DOM 값/선택을 먼저
      // 직접 맞춰둔 뒤에 상태를 동기화한다 - setConcept만 먼저 호출하면, 리렌더
      // 시점에 React가 controlled input의 커서 위치를 보존하려고 하면서 우리가
      // 지정한 선택 범위를 덮어써 버린다(연속 타이핑 시 선택이 끝으로 붕괴되는
      // 원인이었다). DOM을 먼저 원하는 최종 상태로 만들어 두면 React는 값이
      // 이미 일치한다고 보고 선택 영역을 건드리지 않는다.
      input.value = match;
      input.setSelectionRange(rawValue.length, match.length);
      setConcept(match);
      setTypedLength(rawValue.length);
      setIsGhostShown(true);
    } else {
      setConcept(rawValue);
      setTypedLength(null);
      setIsGhostShown(false);
    }
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const hasGhostSelection = input.selectionStart !== input.selectionEnd;

    if (event.key === "Backspace" || event.key === "Delete") {
      suppressGhostRef.current = true;
    } else if (event.key.length === 1) {
      suppressGhostRef.current = false;
    }

    if (event.key === "Tab") {
      // 선택된(=아직 확정 안 된) 인라인 제안이 있을 때만 Tab을 가로채 커서를 끝으로
      // 옮겨 확정한다. 제안이 없거나 이미 확정된 상태라면 Tab은 그대로 다음
      // 포커스 대상(다음 버튼 등)으로 넘어간다 - 포커스 트랩이 되지 않는다.
      if (hasGhostSelection) {
        event.preventDefault();
        const end = input.value.length;
        input.setSelectionRange(end, end);
        setIsGhostShown(false);
        setTypedLength(null);
      }
      return;
    }

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
      if (!showSuggestions || activeIndex === -1) {
        setIsOpen(true);
        setActiveIndex(0);
        return;
      }
      setActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      if (showSuggestions && activeIndex >= 0) {
        event.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
      }
    } else if (event.key === "Escape") {
      if (hasGhostSelection) {
        event.preventDefault();
        rejectGhost(input);
        return;
      }
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
            aria-autocomplete="both"
            aria-expanded={showSuggestions}
            aria-controls={LISTBOX_ID}
            aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
            autoComplete="off"
            spellCheck={false}
            value={concept}
            onChange={handleChange}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onMouseDown={(event) => {
              // 인라인 제안이 뜬 채로 마우스를 누르면(클릭/드래그 시작), 먼저
              // 거절해서 실제로 타이핑한 부분만 남긴다 - 안 그러면 우리가 켠
              // "선택 영역은 회색, 배경 없음" 스타일이 사용자가 직접 드래그한
              // 선택에도 그대로 적용돼 하이라이트가 안 보이는 것처럼 느껴진다.
              const input = event.currentTarget;
              if (input.selectionStart !== input.selectionEnd) {
                rejectGhost(input);
              }
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={(event) => {
              const input = event.currentTarget;
              if (input.selectionStart !== input.selectionEnd) {
                rejectGhost(input);
              }
              setIsOpen(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="배운 기술/개념을 짧게 입력하세요 (예: useEffect, 이벤트 버블링)"
            className={cn(
              "placeholder:text-faint w-full bg-transparent font-mono text-base outline-none",
              // 인라인 제안이 떠 있을 때만 선택 영역을 회색으로 - 그 외의 일반적인
              // 마우스 드래그 선택까지 회색으로 보이면 "선택됨" 표시가 안 보여 혼동된다.
              isGhostShown && "selection:text-faint selection:bg-transparent",
            )}
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
