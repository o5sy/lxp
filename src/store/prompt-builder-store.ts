import { create } from "zustand";

export type PcmlStage = "recall" | "apply" | "explain";

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
}));
