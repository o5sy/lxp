"use client";

import { FeedbackPanel } from "@/features/feedback-panel/components/feedback-panel";
import { InstructionPanel } from "@/features/feedback-panel/components/instruction-panel";
import { PracticeEditorPanel } from "@/features/practice-editor/components/practice-editor-panel";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export default function PracticeSessionPage() {
  const concept = usePromptBuilderStore((state) => state.concept);

  return (
    <div className="bg-background flex h-screen flex-col">
      <header className="bg-titlebar border-line flex h-11 shrink-0 items-center border-b px-4">
        <p className="text-muted-foreground font-mono text-xs">{concept || "실습"} 실습</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="border-line w-[320px] shrink-0 border-r">
          <InstructionPanel />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="border-line flex-1 border-b">
            <PracticeEditorPanel />
          </div>
          <div className="h-[220px] shrink-0">
            <FeedbackPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
