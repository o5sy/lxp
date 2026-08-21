import { FeedbackPanel } from "@/features/feedback-panel/components/feedback-panel";
import { PracticeEditorPanel } from "@/features/practice-editor/components/practice-editor-panel";
import { PromptBuilderPanel } from "@/features/prompt-builder/components/prompt-builder-panel";

export default function Home() {
  return (
    <div className="bg-background flex flex-1 justify-center px-6 py-10">
      <main className="grid w-full max-w-[980px] flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-6">
          <PromptBuilderPanel />
          <FeedbackPanel />
        </div>
        <PracticeEditorPanel />
      </main>
    </div>
  );
}
