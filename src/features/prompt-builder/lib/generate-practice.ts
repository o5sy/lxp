import type { PracticeGenerationInput } from "@/lib/llm/types";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

async function* parseSSE(response: Response) {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const eventLine = rawEvent.split("\n").find((line) => line.startsWith("event: "));
      const dataLine = rawEvent.split("\n").find((line) => line.startsWith("data: "));
      if (eventLine && dataLine) {
        yield {
          event: eventLine.slice("event: ".length),
          data: JSON.parse(dataLine.slice("data: ".length)) as string,
        };
      }

      boundary = buffer.indexOf("\n\n");
    }
  }
}

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
