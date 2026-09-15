"use client";

import { useRouter } from "next/navigation";

import { InstructionMarkdown } from "@/features/feedback-panel/components/instruction-markdown";
import { PRACTICE_DIFFICULTIES } from "@/features/prompt-builder/lib/options";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export function InstructionPanel() {
  const router = useRouter();
  const concept = usePromptBuilderStore((state) => state.concept);
  const difficulty = usePromptBuilderStore((state) => state.difficulty);
  const freeText = usePromptBuilderStore((state) => state.freeText);
  const generationStatus = usePromptBuilderStore((state) => state.generationStatus);
  const instruction = usePromptBuilderStore((state) => state.instruction);
  const generationError = usePromptBuilderStore((state) => state.generationError);
  const rejectionReason = usePromptBuilderStore((state) => state.rejectionReason);
  const returnToConceptStep = usePromptBuilderStore((state) => state.returnToConceptStep);
  const feedbackRounds = usePromptBuilderStore((state) => state.feedbackRounds);
  const criteriaChecks = feedbackRounds.at(-1)?.criteriaChecks ?? null;

  const difficultyOption = PRACTICE_DIFFICULTIES.find((option) => option.value === difficulty);
  const summary = [concept, difficultyOption?.title].filter(Boolean).join(" · ");

  const header = (
    <>
      <p className="text-faint mb-3 font-mono text-xs tracking-wide uppercase">instructions</p>
      <p className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
        # {summary || "실습을 생성하지 않은 상태입니다"}
      </p>
      {freeText && <p className="text-muted-foreground mt-2 text-sm">&ldquo;{freeText}&rdquo;</p>}
    </>
  );

  if (generationStatus !== "error" && instruction) {
    return (
      <InstructionMarkdown
        content={instruction}
        header={header}
        isStreaming={generationStatus === "streaming"}
        criteriaChecks={criteriaChecks}
      />
    );
  }

  if (generationStatus === "rejected") {
    return (
      <div className="flex h-full flex-col overflow-y-auto p-6">
        {header}
        <p className="mt-2 text-sm text-amber-500">{rejectionReason}</p>
        <button
          type="button"
          onClick={() => {
            returnToConceptStep();
            router.push("/");
          }}
          className="text-primary border-line mt-4 w-fit cursor-pointer rounded-md border px-3 py-1.5 font-mono text-xs"
        >
          ← 개념 수정하기
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      {header}

      {generationStatus === "error" ? (
        <p className="mt-2 text-sm text-red-500">{generationError}</p>
      ) : (
        <p className="text-muted-foreground mt-2 text-sm">
          {generationStatus === "loading" ? "실습 지시문을 생성하는 중입니다..." : "실습 지시가 생성되면 여기에 스트리밍으로 표시됩니다."}
        </p>
      )}
    </div>
  );
}
