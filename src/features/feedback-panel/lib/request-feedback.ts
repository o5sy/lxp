import type { FeedbackInput } from "@/lib/llm/types";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export async function requestFeedback(input: FeedbackInput) {
  const { startFeedback, appendFeedback, setFeedbackDone, setFeedbackError } = usePromptBuilderStore.getState();

  startFeedback();

  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok || !response.body) {
      throw new Error(await response.text());
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      appendFeedback(decoder.decode(value, { stream: true }));
    }

    setFeedbackDone();
  } catch (error) {
    setFeedbackError(error instanceof Error ? error.message : "피드백 요청에 실패했습니다.");
  }
}
