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

function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[rows - 1][cols - 1];
}

/**
 * 타이핑한 텍스트가 화이트리스트에 완전히 매치되진 않지만("useStat"처럼
 * 오타/미완성 입력) 키워드 하나와 아주 가까울 때, 그 키워드를 보정 제안으로
 * 돌려준다. 애매한 개념은 여전히 LLM 판별로 넘어가야 하므로, 편집 거리가
 * 짧을 때(키워드 길이의 25% 이내, 최소 1)만 제안한다.
 */
export function findClosestKeyword(
  concept: string,
  category: keyof typeof CONCEPT_WHITELIST_BY_CATEGORY = "frontend",
): string | null {
  const normalizedConcept = normalize(concept);
  if (normalizedConcept.length < 3) return null;
  if (isLocallyRecognized(concept, category)) return null;

  const keywords = CONCEPT_WHITELIST_BY_CATEGORY[category] ?? [];
  let closest: { keyword: string; distance: number } | null = null;

  for (const keyword of keywords) {
    const normalizedKeyword = normalize(keyword);
    const distance = levenshteinDistance(normalizedConcept, normalizedKeyword);
    const threshold = Math.max(1, Math.floor(normalizedKeyword.length * 0.25));
    if (distance <= threshold && (!closest || distance < closest.distance)) {
      closest = { keyword, distance };
    }
  }

  return closest?.keyword ?? null;
}
