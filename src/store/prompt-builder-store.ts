import { create } from "zustand";

import type { FeedbackCriterionCheck } from "@/lib/llm/types";

export type PracticeDifficulty = "typing" | "apply" | "stretch";

export type AsyncStatus = "idle" | "loading" | "streaming" | "done" | "error" | "rejected";

export type ConceptCheckStatus = "idle" | "checking" | "valid" | "invalid";

export const TOTAL_BUILDER_STEPS = 3;

export type FeedbackRound = {
  feedback: string;
  criteriaChecks: FeedbackCriterionCheck[] | null;
};

type PromptBuilderState = {
  step: number;
  concept: string;
  difficulty: PracticeDifficulty | null;
  freeText: string;
  setConcept: (concept: string) => void;
  setDifficulty: (difficulty: PracticeDifficulty) => void;
  setFreeText: (freeText: string) => void;
  goNext: () => void;
  goBack: () => void;
  returnToConceptStep: () => void;
  reset: () => void;

  conceptCheckStatus: ConceptCheckStatus;
  conceptCheckReason: string | null;
  startConceptCheck: () => void;
  setConceptCheckValid: () => void;
  setConceptCheckInvalid: (reason: string) => void;

  generationStatus: AsyncStatus;
  instruction: string;
  starterCode: string | null;
  generationError: string | null;
  rejectionReason: string | null;
  startGeneration: () => void;
  appendInstruction: (delta: string) => void;
  setStarterCode: (code: string) => void;
  setGenerationDone: () => void;
  setGenerationError: (message: string) => void;
  setConceptRejected: (reason: string) => void;

  feedbackStatus: AsyncStatus;
  feedbackRounds: FeedbackRound[];
  feedbackError: string | null;
  startFeedback: () => void;
  appendFeedback: (delta: string) => void;
  setFeedbackVerdict: (criteriaChecks: FeedbackCriterionCheck[]) => void;
  setFeedbackDone: () => void;
  setFeedbackError: (message: string) => void;
};

export const usePromptBuilderStore = create<PromptBuilderState>((set) => ({
  step: 1,
  concept: "",
  difficulty: null,
  freeText: "",
  // 개념 텍스트가 바뀌면 이전 판별 결과는 더 이상 유효하지 않다.
  setConcept: (concept) => set({ concept, conceptCheckStatus: "idle", conceptCheckReason: null }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setFreeText: (freeText) => set({ freeText }),
  goNext: () => set((state) => ({ step: Math.min(state.step + 1, TOTAL_BUILDER_STEPS) })),
  goBack: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  returnToConceptStep: () => set({ step: 1, conceptCheckStatus: "idle", conceptCheckReason: null }),
  reset: () =>
    set({ step: 1, concept: "", difficulty: null, freeText: "", conceptCheckStatus: "idle", conceptCheckReason: null }),

  conceptCheckStatus: "idle",
  conceptCheckReason: null,
  startConceptCheck: () => set({ conceptCheckStatus: "checking", conceptCheckReason: null }),
  setConceptCheckValid: () => set({ conceptCheckStatus: "valid", conceptCheckReason: null }),
  setConceptCheckInvalid: (reason) => set({ conceptCheckStatus: "invalid", conceptCheckReason: reason }),

  generationStatus: "idle",
  instruction: "",
  starterCode: null,
  generationError: null,
  rejectionReason: null,
  startGeneration: () =>
    set({
      generationStatus: "loading",
      instruction: "",
      starterCode: null,
      generationError: null,
      rejectionReason: null,
    }),
  appendInstruction: (delta) =>
    set((state) => ({ generationStatus: "streaming", instruction: state.instruction + delta })),
  setStarterCode: (code) => set({ starterCode: code }),
  setGenerationDone: () => set({ generationStatus: "done" }),
  setGenerationError: (message) => set({ generationStatus: "error", generationError: message }),
  setConceptRejected: (reason) => set({ generationStatus: "rejected", rejectionReason: reason }),

  feedbackStatus: "idle",
  feedbackRounds: [],
  feedbackError: null,
  startFeedback: () =>
    set((state) => ({
      feedbackStatus: "loading",
      feedbackRounds: [...state.feedbackRounds, { feedback: "", criteriaChecks: null }],
      feedbackError: null,
    })),
  appendFeedback: (delta) =>
    set((state) => ({
      feedbackStatus: "streaming",
      feedbackRounds: state.feedbackRounds.map((round, index) =>
        index === state.feedbackRounds.length - 1 ? { ...round, feedback: round.feedback + delta } : round,
      ),
    })),
  setFeedbackVerdict: (criteriaChecks) =>
    set((state) => ({
      feedbackRounds: state.feedbackRounds.map((round, index) =>
        index === state.feedbackRounds.length - 1 ? { ...round, criteriaChecks } : round,
      ),
    })),
  setFeedbackDone: () => set({ feedbackStatus: "done" }),
  setFeedbackError: (message) =>
    set((state) => {
      const lastRound = state.feedbackRounds.at(-1);
      const isEmptyRound = lastRound && lastRound.feedback === "" && lastRound.criteriaChecks === null;
      return {
        feedbackStatus: "error",
        feedbackError: message,
        feedbackRounds: isEmptyRound ? state.feedbackRounds.slice(0, -1) : state.feedbackRounds,
      };
    }),
}));
