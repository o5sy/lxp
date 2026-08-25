"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { generatePractice } from "@/features/prompt-builder/lib/generate-practice";
import { generatePracticeMock } from "@/features/prompt-builder/lib/generate-practice-mock";
import { InstructionPanel } from "@/features/feedback-panel/components/instruction-panel";
import { useResizablePanel } from "@/shared/hooks/use-resizable-panel";
import { ResizeHandle } from "@/shared/ui/resize-handle";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
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
  const useMock = useSearchParams().get("mock") === "1";

  useEffect(() => {
    if (usePromptBuilderStore.getState().generationStatus !== "idle") return;
    if (useMock) {
      generatePracticeMock();
      return;
    }
    if (!concept.trim() || !stage) return;
    generatePractice({ concept, stage, situationTags, freeText });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const instructionPane = useResizablePanel({ axis: "horizontal", initialSize: 320, min: 240, max: 560 });

  return (
    <div className="bg-background flex h-screen flex-col">
      <header className="bg-titlebar border-line flex h-11 shrink-0 items-center justify-between border-b px-4">
        <p className="text-muted-foreground font-mono text-xs">{concept || "실습"} 실습</p>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div style={{ width: instructionPane.size }} className="border-line shrink-0 overflow-hidden border-r">
          <InstructionPanel />
        </div>

        <ResizeHandle
          axis="horizontal"
          isDragging={instructionPane.isDragging}
          onPointerDown={instructionPane.handlePointerDown}
          onPointerMove={instructionPane.handlePointerMove}
          onPointerUp={instructionPane.handlePointerUp}
        />

        <SandpackSession />
      </div>
    </div>
  );
}
