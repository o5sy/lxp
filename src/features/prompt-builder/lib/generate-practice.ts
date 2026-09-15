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

// 네트워크가 중간에 끊기면 브라우저의 fetch/스트림 읽기가 바로 에러로 잡히지
// 않고 무한정 대기할 수 있다(연결이 "조용히 죽는" 경우 TCP 차원에서 즉시
// 감지가 안 됨). 이 시간 동안 새 청크가 하나도 안 오면 강제로 중단한다.
// 청크가 올 때마다 다시 늘어나므로, 느리지만 살아있는 스트림은 안 끊는다.
const INACTIVITY_TIMEOUT_MS = 20_000;

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

  const controller = new AbortController();
  let inactivityTimer: ReturnType<typeof setTimeout> | undefined;
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => controller.abort(), INACTIVITY_TIMEOUT_MS);
  };

  try {
    resetInactivityTimer();
    const response = await fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(await response.text());
    }

    for await (const { event, data } of parseSSE(response)) {
      resetInactivityTimer();
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
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "응답이 없어 연결이 끊긴 것 같아요. 네트워크 연결을 확인하고 다시 시도해주세요."
        : error instanceof Error
          ? error.message
          : "실습 생성에 실패했습니다.";
    setGenerationError(message);
  } finally {
    clearTimeout(inactivityTimer);
  }
}
