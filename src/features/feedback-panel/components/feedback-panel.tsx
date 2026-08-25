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
        <MarkdownContent content={feedback} className="text-muted-foreground p-4" />
      ) : (
        <p className="text-muted-foreground p-4 text-sm">
          실습이 생성되면 AI 피드백이 여기에 스트리밍으로 표시됩니다.
        </p>
      )}
    </div>
  );
}
