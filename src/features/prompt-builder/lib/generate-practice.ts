import type { PracticeGenerationInput } from "@/lib/llm/types";
import { parseSSE } from "@/shared/lib/parse-sse";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export async function generatePractice(input: PracticeGenerationInput) {
  const { startGeneration, appendInstruction, setStarterCode, setGenerationDone, setGenerationError } =
    usePromptBuilderStore.getState();

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
      if (event === "instruction-delta") {
        appendInstruction(data);
      } else if (event === "code") {
        setStarterCode(data);
      } else if (event === "error") {
        throw new Error(data);
      } else if (event === "done") {
        setGenerationDone();
      }
    }
  } catch (error) {
    setGenerationError(error instanceof Error ? error.message : "실습 생성에 실패했습니다.");
  }
}
