import { FeedbackPanel } from "@/features/feedback-panel/components/feedback-panel";
import { InstructionPanel } from "@/features/feedback-panel/components/instruction-panel";
import { PracticeEditorPanel } from "@/features/practice-editor/components/practice-editor-panel";

export default function PracticeSessionPage() {
  return (
    <div className="bg-background flex flex-1 flex-col gap-4 p-6">
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        <InstructionPanel />
        <PracticeEditorPanel />
      </div>
      <FeedbackPanel />
    </div>
  );
}
