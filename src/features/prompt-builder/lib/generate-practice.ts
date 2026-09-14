import type { PracticeGenerationInput } from "@/lib/llm/types";
import { parseSSE } from "@/shared/lib/parse-sse";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export type PracticeStreamAction =
  | { type: "instruction-delta"; delta: string }
  | { type: "code"; code: string }
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
