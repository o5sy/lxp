"use client";

import { useActiveCode } from "@codesandbox/sandpack-react";
import { useEffect, useRef } from "react";

import { requestFeedback } from "@/features/feedback-panel/lib/request-feedback";
import { MarkdownContent } from "@/shared/ui/markdown-content";
import { type FeedbackRound, usePromptBuilderStore } from "@/store/prompt-builder-store";

function FeedbackCriteriaChecklist({ round }: { round: FeedbackRound }) {
  if (round.criteriaChecks === null) return null;

  const metCount = round.criteriaChecks.filter((check) => check.met).length;

  return (
    <div className="border-line rounded-md border px-3 py-2 text-sm">
      <p className="text-faint mb-1.5 font-mono text-[11px] tracking-wide uppercase">
        완료 기준 · {metCount}/{round.criteriaChecks.length}
      </p>
      <ul className="space-y-1">
        {round.criteriaChecks.map((check, index) => (
          <li key={index} className={check.met ? "text-success" : "text-warning"}>
            {check.met ? "✅" : "⬜"} {check.criterion}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FeedbackPanel() {
  const { code } = useActiveCode();
  const concept = usePromptBuilderStore((state) => state.concept);
  const stage = usePromptBuilderStore((state) => state.stage);
  const instruction = usePromptBuilderStore((state) => state.instruction);
  const generationStatus = usePromptBuilderStore((state) => state.generationStatus);
  const feedbackStatus = usePromptBuilderStore((state) => state.feedbackStatus);
  const feedbackRounds = usePromptBuilderStore((state) => state.feedbackRounds);
  const feedbackError = usePromptBuilderStore((state) => state.feedbackError);

  const logRef = useRef<HTMLDivElement>(null);
  const latestRoundRef = useRef<HTMLDivElement>(null);

  const canRequestFeedback =
    generationStatus === "done" && stage !== null && feedbackStatus !== "loading" && feedbackStatus !== "streaming";

  useEffect(() => {
    if (feedbackStatus === "done") {
      latestRoundRef.current?.scrollIntoView({ block: "start" });
    } else {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    }
  }, [feedbackRounds, feedbackStatus]);

  const handleClick = () => {
    if (!stage) return;
    requestFeedback({ concept, stage, instruction, code });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-line flex shrink-0 items-center justify-between border-b px-4 py-1.5">
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

      <div ref={logRef} className="flex-1 overflow-y-auto">
        {feedbackStatus === "error" && feedbackError ? <p className="p-4 text-sm text-red-500">{feedbackError}</p> : null}

        {feedbackRounds.length > 0 ? (
          <div className="divide-line divide-y">
            {feedbackRounds.map((round, index) => (
              <div
                key={index}
                ref={index === feedbackRounds.length - 1 ? latestRoundRef : undefined}
                className="flex flex-col gap-2 px-4 py-3"
              >
                <p className="text-faint font-mono text-[11px] tracking-wide uppercase">#{index + 1}</p>
                <FeedbackCriteriaChecklist round={round} />
                <MarkdownContent content={round.feedback} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : feedbackStatus !== "error" ? (
          <p className="text-muted-foreground p-4 text-sm">
            코드를 어느 정도 채웠다면 위의 <span className="text-foreground font-medium">피드백 받기</span>를 눌러보세요. 완료
            기준을 충족했는지 확인해드립니다.
          </p>
        ) : null}
      </div>
    </div>
  );
}
