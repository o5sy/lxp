import { FRONTEND_CONCEPT_KEYWORDS } from "@/features/prompt-builder/data/concept-whitelist/frontend";

export const CONCEPT_WHITELIST_BY_CATEGORY: Record<string, string[]> = {
  frontend: FRONTEND_CONCEPT_KEYWORDS,
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

/**
 * 개념이 화이트리스트 카테고리 범주 안에 "명백히" 들어가는지만 빠르게 판별한다.
 * 매치되지 않는다고 부적합인 건 아니다 — 화이트리스트에 없는 정상 개념일 수 있으므로
 * 이 함수는 거부 판정에는 쓰지 않고, 명백한 통과를 빠르게 표시하는 용도로만 쓴다.
 */
export function isLocallyRecognized(
  concept: string,
  category: keyof typeof CONCEPT_WHITELIST_BY_CATEGORY = "frontend",
): boolean {
  const normalizedConcept = normalize(concept);
  if (normalizedConcept.length < 2) return false;

  const keywords = CONCEPT_WHITELIST_BY_CATEGORY[category] ?? [];
  return keywords.some((keyword) => {
    const normalizedKeyword = normalize(keyword);
    if (normalizedConcept.includes(normalizedKeyword)) return true;
    // 키워드가 타이핑한 텍스트를 포함하는 방향("캡처링"이 "이벤트캡처링"의 부분
    // 문자열인 경우)도 인정하되, "us"처럼 짧은 조각이 긴 키워드 여럿에 우연히
    // 걸리지 않도록 타이핑한 길이가 키워드 길이의 절반은 돼야 인정한다.
    return (
      normalizedKeyword.includes(normalizedConcept) &&
      normalizedConcept.length >= normalizedKeyword.length / 2
    );
  });
}
