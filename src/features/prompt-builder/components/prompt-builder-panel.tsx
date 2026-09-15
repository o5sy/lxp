"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { findClosestKeyword, isLocallyRecognized } from "@/features/prompt-builder/data/concept-whitelist";
import { checkConceptValidity } from "@/features/prompt-builder/lib/check-concept-validity";
import { BUILDER_STEP_LABELS } from "@/features/prompt-builder/lib/options";
import { StepRail } from "@/shared/ui/step-rail";
import { TOTAL_BUILDER_STEPS, usePromptBuilderStore } from "@/store/prompt-builder-store";

import { ConceptStep } from "./concept-step";
import { DetailStep } from "./detail-step";
import { DifficultyStep } from "./difficulty-step";

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
  const difficulty = usePromptBuilderStore((state) => state.difficulty);
  const goNext = usePromptBuilderStore((state) => state.goNext);
  const goBack = usePromptBuilderStore((state) => state.goBack);
  const conceptCheckStatus = usePromptBuilderStore((state) => state.conceptCheckStatus);
  const startConceptCheck = usePromptBuilderStore((state) => state.startConceptCheck);
  const setConceptCheckValid = usePromptBuilderStore((state) => state.setConceptCheckValid);
  const setConceptCheckInvalid = usePromptBuilderStore((state) => state.setConceptCheckInvalid);

  // "useStat"처럼 화이트리스트 키워드와 아주 가깝지만 완전히 일치하진 않는
  // 입력은, LLM의 관대한 해석에 맡기지 않고 명확한 키워드로 고치도록 유도한다
  // (concept-step.tsx에 뜨는 보정 제안을 먼저 적용해야 진행 가능).
  const hasPendingSuggestion = step === 1 && findClosestKeyword(concept) !== null;
  const canGoNext =
    (step === 1 && concept.trim().length > 0 && !hasPendingSuggestion) ||
    (step === 2 && difficulty !== null);
  const isCheckingConcept = conceptCheckStatus === "checking";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (step === 1 && hasPendingSuggestion) return;
    if (step === 1 && conceptCheckStatus !== "valid" && !isLocallyRecognized(concept)) {
      startConceptCheck();
      const result = await checkConceptValidity(concept);
      if (!result.valid) {
        setConceptCheckInvalid(result.reason);
        return;
      }
      setConceptCheckValid();
    }
    goNext();
  };

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
      {step === 2 && <DifficultyStep />}
      {step === 3 && <DetailStep />}

      <div className="mt-1 flex justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="text-muted-foreground border-line cursor-pointer rounded-md border px-4 py-2 font-mono text-xs font-medium"
          >
            ← 뒤로
          </button>
        ) : (
          <span />
        )}

        {step < TOTAL_BUILDER_STEPS ? (
          <button
            type="button"
            disabled={!canGoNext || isCheckingConcept}
            onClick={handleNext}
            className="bg-primary text-primary-foreground cursor-pointer rounded-md px-4 py-2 font-mono text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCheckingConcept ? "확인하는 중..." : "다음 →"}
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground cursor-pointer rounded-md px-4 py-2 font-mono text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "생성하는 중..." : "실습 생성하기 →"}
          </button>
        )}
      </div>

      {process.env.NODE_ENV === "development" && (
        <button
          type="button"
          onClick={() => router.push("/practice/mock-preview?mock=1")}
          className="text-faint cursor-pointer self-end font-mono text-[11px] underline underline-offset-2"
        >
          목데이터로 미리보기 (API 호출 없음)
        </button>
      )}
    </div>
  );
}
