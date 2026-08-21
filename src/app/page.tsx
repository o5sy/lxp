import { PromptBuilderPanel } from "@/features/prompt-builder/components/prompt-builder-panel";

export default function Home() {
  return (
    <div className="bg-background flex flex-1 items-center justify-center px-6 py-8">
      <div className="w-full max-w-lg">
        <PromptBuilderPanel />
      </div>
    </div>
  );
}
