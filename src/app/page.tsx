import { PromptBuilderPanel } from "@/features/prompt-builder/components/prompt-builder-panel";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

export default function Home() {
  return (
    <div className="bg-background relative flex flex-1 justify-center px-6 py-16">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className="w-full max-w-xl">
        <PromptBuilderPanel />
      </div>
    </div>
  );
}
