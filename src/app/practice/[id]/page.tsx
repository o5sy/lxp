"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

import { generatePractice } from "@/features/prompt-builder/lib/generate-practice";
import { InstructionPanel } from "@/features/feedback-panel/components/instruction-panel";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

const SandpackSession = dynamic(
  () => import("@/features/practice-editor/components/sandpack-session").then((mod) => mod.SandpackSession),
  { ssr: false },
);

export default function PracticeSessionPage() {
  const concept = usePromptBuilderStore((state) => state.concept);
  const stage = usePromptBuilderStore((state) => state.stage);
  const situationTags = usePromptBuilderStore((state) => state.situationTags);
  const freeText = usePromptBuilderStore((state) => state.freeText);

  useEffect(() => {
    if (usePromptBuilderStore.getState().generationStatus !== "idle") return;
    if (!concept.trim() || !stage) return;
    generatePractice({ concept, stage, situationTags, freeText });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-background flex h-screen flex-col">
      <header className="bg-titlebar border-line flex h-11 shrink-0 items-center border-b px-4">
        <p className="text-muted-foreground font-mono text-xs">{concept || "실습"} 실습</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="border-line w-[320px] shrink-0 border-r">
          <InstructionPanel />
        </div>

        <SandpackSession />
      </div>
    </div>
  );
}
