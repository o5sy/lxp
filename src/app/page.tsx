import { PromptBuilderPanel } from "@/features/prompt-builder/components/prompt-builder-panel";

export default function Home() {
  return (
    <div className="bg-background flex flex-1 justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <PromptBuilderPanel />
      </div>
    </div>
  );
}
