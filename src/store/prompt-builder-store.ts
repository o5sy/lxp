import { create } from "zustand";

export type PcmlStage = "recall" | "apply" | "explain";

export type AsyncStatus = "idle" | "loading" | "streaming" | "done" | "error";

export const TOTAL_BUILDER_STEPS = 4;

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
  feedback: string;
  feedbackCriteriaMet: boolean | null;
  feedbackUnmetReasons: string[];
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
  feedback: "",
  feedbackCriteriaMet: null,
  feedbackUnmetReasons: [],
  feedbackError: null,
  startFeedback: () =>
    set({ feedbackStatus: "loading", feedback: "", feedbackCriteriaMet: null, feedbackUnmetReasons: [], feedbackError: null }),
  appendFeedback: (delta) => set((state) => ({ feedbackStatus: "streaming", feedback: state.feedback + delta })),
  setFeedbackVerdict: (criteriaMet, unmetReasons) =>
    set({ feedbackCriteriaMet: criteriaMet, feedbackUnmetReasons: unmetReasons }),
  setFeedbackDone: () => set({ feedbackStatus: "done" }),
  setFeedbackError: (message) => set({ feedbackStatus: "error", feedbackError: message }),
}));
