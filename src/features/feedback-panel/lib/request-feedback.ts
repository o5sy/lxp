import type { FeedbackCriterionCheck, FeedbackInput } from "@/lib/llm/types";
import { parseSSE } from "@/shared/lib/parse-sse";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export type FeedbackStreamAction =
  | { type: "feedback-delta"; delta: string }
  | { type: "verdict"; criteriaChecks: FeedbackCriterionCheck[] }
  | { type: "error"; message: string }
  | { type: "done" };

export function resolveFeedbackStreamEvent(
  event: string,
  data: string,
): FeedbackStreamAction | null {
  switch (event) {
    case "feedback-delta":
      return { type: "feedback-delta", delta: data };
    case "verdict": {
      const verdict = JSON.parse(data) as { criteriaChecks: FeedbackCriterionCheck[] };
      return { type: "verdict", criteriaChecks: verdict.criteriaChecks };
    }
    case "error":
      return { type: "error", message: data };
    case "done":
      return { type: "done" };
    default:
      return null;
  }
}

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
      const action = resolveFeedbackStreamEvent(event, data);
      if (!action) continue;

      switch (action.type) {
        case "feedback-delta":
          appendFeedback(action.delta);
          break;
        case "verdict":
          setFeedbackVerdict(action.criteriaChecks);
          break;
        case "error":
          throw new Error(action.message);
        case "done":
          setFeedbackDone();
          break;
      }
    }
  } catch (error) {
    setFeedbackError(error instanceof Error ? error.message : "피드백 요청에 실패했습니다.");
  }
}
