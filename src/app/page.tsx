import { PromptBuilderPanel } from "@/features/prompt-builder/components/prompt-builder-panel";
import { StepRail } from "@/shared/ui/step-rail";

export default function Home() {
  return (
    <div className="bg-background flex flex-1 justify-center px-6 py-16">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <StepRail currentStep={1} totalSteps={4} stepLabel="개념 선택" />
        <PromptBuilderPanel />
      </div>
    </div>
  );
}
