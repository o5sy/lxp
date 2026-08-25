"use client";

import { useActiveCode } from "@codesandbox/sandpack-react";

import { requestFeedback } from "@/features/feedback-panel/lib/request-feedback";
import { MarkdownContent } from "@/shared/ui/markdown-content";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export function FeedbackPanel() {
  const { code } = useActiveCode();
  const concept = usePromptBuilderStore((state) => state.concept);
  const stage = usePromptBuilderStore((state) => state.stage);
  const instruction = usePromptBuilderStore((state) => state.instruction);
  const generationStatus = usePromptBuilderStore((state) => state.generationStatus);
  const feedbackStatus = usePromptBuilderStore((state) => state.feedbackStatus);
  const feedback = usePromptBuilderStore((state) => state.feedback);
  const feedbackCriteriaMet = usePromptBuilderStore((state) => state.feedbackCriteriaMet);
  const feedbackUnmetReasons = usePromptBuilderStore((state) => state.feedbackUnmetReasons);
  const feedbackError = usePromptBuilderStore((state) => state.feedbackError);

  const canRequestFeedback =
    generationStatus === "done" && stage !== null && feedbackStatus !== "loading" && feedbackStatus !== "streaming";

  const handleClick = () => {
    if (!stage) return;
    requestFeedback({ concept, stage, instruction, code });
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-line flex shrink-0 items-center justify-between border-b px-4 py-2.5">
        <p className="text-faint font-mono text-xs tracking-wide uppercase">ai-feedback</p>
        <button
          type="button"
          disabled={!canRequestFeedback}
          onClick={handleClick}
          className="text-muted-foreground border-line rounded-md border px-4 py-1.5 font-mono text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          {feedbackStatus === "loading" || feedbackStatus === "streaming" ? "받는 중..." : "피드백 받기"}
        </button>
      </div>

      {feedbackStatus === "error" ? (
        <p className="p-4 text-sm text-red-500">{feedbackError}</p>
      ) : feedback ? (
        <div className="flex flex-col gap-3 p-4">
          {feedbackStatus === "done" && feedbackCriteriaMet !== null ? (
            <div
              className={
                feedbackCriteriaMet
                  ? "border-success/40 bg-success/10 text-success rounded-md border px-3 py-2 text-sm"
                  : "border-warning/40 bg-warning/10 text-warning rounded-md border px-3 py-2 text-sm"
              }
            >
              <p className="font-medium">{feedbackCriteriaMet ? "✅ 완료 기준 충족" : "⚠️ 아직 부족한 부분이 있어요"}</p>
              {!feedbackCriteriaMet && feedbackUnmetReasons.length > 0 ? (
                <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
                  {feedbackUnmetReasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
          <MarkdownContent content={feedback} className="text-muted-foreground" />
        </div>
      ) : (
        <p className="text-muted-foreground p-4 text-sm">
          실습이 생성되면 AI 피드백이 여기에 스트리밍으로 표시됩니다.
        </p>
      )}
    </div>
  );
}
