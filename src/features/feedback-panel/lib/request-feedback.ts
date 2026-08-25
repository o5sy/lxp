import type { FeedbackInput } from "@/lib/llm/types";
import { parseSSE } from "@/shared/lib/parse-sse";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export async function requestFeedback(input: FeedbackInput) {
  const { startFeedback, appendFeedback, setFeedbackVerdict, setFeedbackDone, setFeedbackError } =
    usePromptBuilderStore.getState();

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

    for await (const { event, data } of parseSSE(response)) {
      if (event === "feedback-delta") {
        appendFeedback(data);
      } else if (event === "verdict") {
        const verdict = JSON.parse(data) as { criteriaMet: boolean; unmetReasons?: string[] };
        setFeedbackVerdict(verdict.criteriaMet, verdict.unmetReasons ?? []);
      } else if (event === "error") {
        throw new Error(data);
      } else if (event === "done") {
        setFeedbackDone();
      }
    }
  } catch (error) {
    setFeedbackError(error instanceof Error ? error.message : "피드백 요청에 실패했습니다.");
  }
}
