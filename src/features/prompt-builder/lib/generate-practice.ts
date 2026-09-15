import type { PracticeGenerationInput } from "@/lib/llm/types";
import { parseSSE } from "@/shared/lib/parse-sse";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export type PracticeStreamAction =
  | { type: "instruction-delta"; delta: string }
  | { type: "code"; code: string }
  | { type: "rejected"; reason: string }
  | { type: "suggestion"; suggestion: string }
  | { type: "error"; message: string }
  | { type: "done" };

export function resolvePracticeStreamEvent(
  event: string,
  data: string,
): PracticeStreamAction | null {
  switch (event) {
    case "instruction-delta":
      return { type: "instruction-delta", delta: data };
    case "code":
      return { type: "code", code: data };
    case "rejected":
      return { type: "rejected", reason: data };
    case "suggestion":
      return { type: "suggestion", suggestion: data };
    case "error":
      return { type: "error", message: data };
    case "done":
      return { type: "done" };
    default:
      return null;
  }
}

export async function generatePractice(input: PracticeGenerationInput) {
  const {
    startGeneration,
    appendInstruction,
    setStarterCode,
    setGenerationDone,
    setGenerationError,
    setConceptRejected,
  } = usePromptBuilderStore.getState();

  startGeneration();

  try {
    const response = await fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok || !response.body) {
      throw new Error(await response.text());
    }

    for await (const { event, data } of parseSSE(response)) {
      const action = resolvePracticeStreamEvent(event, data);
      if (!action) continue;

      switch (action.type) {
        case "instruction-delta":
          appendInstruction(action.delta);
          break;
        case "code":
          setStarterCode(action.code);
          break;
        case "rejected":
          setConceptRejected(action.reason);
          return;
        case "suggestion":
          // 1단계 사전 판별을 우회한 드문 경우의 안전망 - 결과 페이지에는
          // 별도 보정 UI가 없으므로, 기존 거부 화면(이유 + 개념 수정하기)을
          // 재사용해 제안을 안내한다.
          setConceptRejected(`혹시 '${action.suggestion}'을(를) 말씀하신 게 아닐까요? 개념을 다시 확인해주세요.`);
          return;
        case "error":
          throw new Error(action.message);
        case "done":
          setGenerationDone();
          break;
      }
    }
  } catch (error) {
    setGenerationError(error instanceof Error ? error.message : "실습 생성에 실패했습니다.");
  }
}
