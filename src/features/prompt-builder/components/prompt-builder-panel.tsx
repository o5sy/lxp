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
  const setConceptSuggestion = usePromptBuilderStore((state) => state.setConceptSuggestion);

  const canGoNext = (step === 1 && concept.trim().length > 0) || (step === 2 && difficulty !== null);
  const isCheckingConcept = conceptCheckStatus === "checking";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      // 1. 로컬에서 오타/미완성 입력(화이트리스트 키워드와 아주 가깝지만
      //    완전히 일치하진 않는 경우)인지 지금(클릭 시점) 판별한다. 타이핑
      //    중에는 이 체크를 하지 않는다 - "다음"을 눌렀을 때만 확인한다.
      const suggestion = findClosestKeyword(concept);
      if (suggestion) {
        setConceptSuggestion(suggestion);
        return; // LLM 호출 없이 보정 제안부터 보여주고 멈춘다.
      }

      // 2. 화이트리스트에 명백히 매치되지도, 오타/미완성 후보도 아닌 애매한
      //    입력만 LLM 호출로 판별한다.
      if (conceptCheckStatus !== "valid" && !isLocallyRecognized(concept)) {
        startConceptCheck();
        const result = await checkConceptValidity(concept);
        if (!result.valid) {
          // LLM이 오타/축약형으로 보인다고 판단해 보정 제안을 준 경우, 화이트리스트
          // 기반 제안과 같은 UI(conceptSuggestion)로 보여준다.
          if ("suggestion" in result) {
            setConceptSuggestion(result.suggestion);
          } else {
            setConceptCheckInvalid(result.reason);
          }
          return;
        }
        setConceptCheckValid();
      }
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
