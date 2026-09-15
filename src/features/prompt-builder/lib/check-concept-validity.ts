import { parseSSE } from "@/shared/lib/parse-sse";

export type ConceptCheckResult =
  | { valid: true }
  | { valid: false; reason: string }
  | { valid: false; suggestion: string };

/**
 * 1단계에서 화이트리스트에 없는 개념을 제출하기 전에, 실습 본문 없이 판별
 * 필드만 가벼운 모델로 먼저 확인한다. difficulty/freeText는 아직 정해지지
 * 않았으므로 자리표시자 값을 쓴다 — 적합성 판단 자체는 난이도와 무관하다.
 */
export async function checkConceptValidity(concept: string): Promise<ConceptCheckResult> {
  try {
    const response = await fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept, difficulty: "typing", freeText: "", checkOnly: true }),
    });

    if (!response.ok || !response.body) {
      return { valid: true };
    }

    for await (const { event, data } of parseSSE(response)) {
      if (event === "suggestion") return { valid: false, suggestion: data };
      if (event === "rejected") return { valid: false, reason: data };
      if (event === "done") return { valid: true };
      if (event === "error") return { valid: true };
    }
    return { valid: true };
  } catch {
    // 판별 호출 자체가 실패해도 사용자 진행을 막지 않는다 — 최종 생성 호출에서
    // 다시 한번 판별된다.
    return { valid: true };
  }
}
