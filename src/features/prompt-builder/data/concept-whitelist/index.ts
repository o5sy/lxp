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
  // 타이핑한 텍스트가 키워드 전체를 완전히 포함할 때만 인정한다. 반대 방향
  // (키워드가 타이핑한 텍스트를 포함 - "useSt"가 "useState"의 부분 문자열인 경우)은
  // 인정하지 않는다 - 이 인식 결과가 route.ts에서 LLM 판별 자체를 건너뛰는 데
  // 쓰이므로, "useSt"처럼 불완전한 조각까지 통과시키면 검증되지 않은 입력이
  // 그대로 생성 단계로 넘어간다.
  return keywords.some((keyword) => normalizedConcept.includes(normalize(keyword)));
}
