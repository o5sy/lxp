import { create } from "zustand";

export type PcmlStage = "recall" | "apply" | "explain";

export type AsyncStatus = "idle" | "loading" | "streaming" | "done" | "error";

export const TOTAL_BUILDER_STEPS = 4;

export type FeedbackRound = {
  feedback: string;
  criteriaMet: boolean | null;
  unmetReasons: string[];
};

type PromptBuilderState = {
  step: number;
  concept: string;
  stage: PcmlStage | null;
  situationTags: string[];
  freeText: string;
  setConcept: (concept: string) => void;
  setStage: (stage: PcmlStage) => void;
  toggleSituationTag: (tag: string) => void;
  setFreeText: (freeText: string) => void;
  goNext: () => void;
  goBack: () => void;
  reset: () => void;

  generationStatus: AsyncStatus;
  instruction: string;
  starterCode: string | null;
  generationError: string | null;
  startGeneration: () => void;
  appendInstruction: (delta: string) => void;
  setStarterCode: (code: string) => void;
  setGenerationDone: () => void;
  setGenerationError: (message: string) => void;

  feedbackStatus: AsyncStatus;
  feedbackRounds: FeedbackRound[];
  feedbackError: string | null;
  startFeedback: () => void;
  appendFeedback: (delta: string) => void;
  setFeedbackVerdict: (criteriaMet: boolean, unmetReasons: string[]) => void;
  setFeedbackDone: () => void;
  setFeedbackError: (message: string) => void;
};

export const usePromptBuilderStore = create<PromptBuilderState>((set) => ({
  step: 1,
  concept: "",
  stage: null,
  situationTags: [],
  freeText: "",
  setConcept: (concept) => set({ concept }),
  setStage: (stage) => set({ stage }),
  toggleSituationTag: (tag) =>
    set((state) => ({
      situationTags: state.situationTags.includes(tag)
        ? state.situationTags.filter((t) => t !== tag)
        : [...state.situationTags, tag],
    })),
  setFreeText: (freeText) => set({ freeText }),
  goNext: () => set((state) => ({ step: Math.min(state.step + 1, TOTAL_BUILDER_STEPS) })),
  goBack: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  reset: () =>
    set({ step: 1, concept: "", stage: null, situationTags: [], freeText: "" }),

  generationStatus: "idle",
  instruction: "",
  starterCode: null,
  generationError: null,
  startGeneration: () =>
    set({ generationStatus: "loading", instruction: "", starterCode: null, generationError: null }),
  appendInstruction: (delta) =>
    set((state) => ({ generationStatus: "streaming", instruction: state.instruction + delta })),
  setStarterCode: (code) => set({ starterCode: code }),
  setGenerationDone: () => set({ generationStatus: "done" }),
  setGenerationError: (message) => set({ generationStatus: "error", generationError: message }),

  feedbackStatus: "idle",
  feedbackRounds: [],
  feedbackError: null,
  startFeedback: () =>
    set((state) => ({
      feedbackStatus: "loading",
      feedbackRounds: [...state.feedbackRounds, { feedback: "", criteriaMet: null, unmetReasons: [] }],
      feedbackError: null,
    })),
  appendFeedback: (delta) =>
    set((state) => ({
      feedbackStatus: "streaming",
      feedbackRounds: state.feedbackRounds.map((round, index) =>
        index === state.feedbackRounds.length - 1 ? { ...round, feedback: round.feedback + delta } : round,
      ),
    })),
  setFeedbackVerdict: (criteriaMet, unmetReasons) =>
    set((state) => ({
      feedbackRounds: state.feedbackRounds.map((round, index) =>
        index === state.feedbackRounds.length - 1 ? { ...round, criteriaMet, unmetReasons } : round,
      ),
    })),
  setFeedbackDone: () => set({ feedbackStatus: "done" }),
  setFeedbackError: (message) =>
    set((state) => {
      const lastRound = state.feedbackRounds.at(-1);
      const isEmptyRound = lastRound && lastRound.feedback === "" && lastRound.criteriaMet === null;
      return {
        feedbackStatus: "error",
        feedbackError: message,
        feedbackRounds: isEmptyRound ? state.feedbackRounds.slice(0, -1) : state.feedbackRounds,
      };
    }),
}));
