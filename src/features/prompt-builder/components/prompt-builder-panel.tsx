"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BUILDER_STEP_LABELS } from "@/features/prompt-builder/lib/options";
import { StepRail } from "@/shared/ui/step-rail";
import { TOTAL_BUILDER_STEPS, usePromptBuilderStore } from "@/store/prompt-builder-store";

import { ConceptStep } from "./concept-step";
import { DetailStep } from "./detail-step";
import { SituationStep } from "./situation-step";
import { StageStep } from "./stage-step";

function slugify(concept: string) {
  const slug = concept
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "practice";
}

export function PromptBuilderPanel() {
  const router = useRouter();
  const step = usePromptBuilderStore((state) => state.step);
  const concept = usePromptBuilderStore((state) => state.concept);
  const stage = usePromptBuilderStore((state) => state.stage);
  const goNext = usePromptBuilderStore((state) => state.goNext);
  const goBack = usePromptBuilderStore((state) => state.goBack);

  const canGoNext =
    (step === 1 && concept.trim().length > 0) || (step === 2 && stage !== null) || step === 3;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    router.push(`/practice/${slugify(concept)}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <StepRail
        currentStep={step}
        totalSteps={TOTAL_BUILDER_STEPS}
        stepLabel={BUILDER_STEP_LABELS[step - 1]}
      />

      {step === 1 && <ConceptStep />}
      {step === 2 && <StageStep />}
      {step === 3 && <SituationStep />}
      {step === 4 && <DetailStep />}

      <div className="mt-1 flex justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="text-muted-foreground border-line rounded-md border px-4 py-2 font-mono text-xs font-medium"
          >
            ← 뒤로
          </button>
        ) : (
          <span />
        )}

        {step < TOTAL_BUILDER_STEPS ? (
          <button
            type="button"
            disabled={!canGoNext}
            onClick={goNext}
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 font-mono text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            다음 →
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground rounded-md px-4 py-2 font-mono text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "생성하는 중..." : "실습 생성하기 →"}
          </button>
        )}
      </div>

      {process.env.NODE_ENV === "development" && (
        <button
          type="button"
          onClick={() => router.push("/practice/mock-preview?mock=1")}
          className="text-faint self-end font-mono text-[11px] underline underline-offset-2"
        >
          목데이터로 미리보기 (API 호출 없음)
        </button>
      )}
    </div>
  );
}
