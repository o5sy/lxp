"use client";

import { PCML_STAGES } from "@/features/prompt-builder/lib/options";
import { cn } from "@/shared/lib/utils";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export function StageStep() {
  const stage = usePromptBuilderStore((state) => state.stage);
  const setStage = usePromptBuilderStore((state) => state.setStage);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-faint font-mono text-xs">stage</p>
      <h2 className="font-heading text-foreground text-[26px] italic">
        지금 이 개념, 어디까지 왔나요?
      </h2>
      <p className="text-muted-foreground max-w-md text-sm">
        가장 가까운 상태 하나를 골라주세요. 어느 쪽이든 괜찮아요.
      </p>
      <ul className="border-line bg-card overflow-hidden rounded-md border">
        {PCML_STAGES.map((option, index) => {
          const selected = stage === option.value;
          return (
            <li key={option.value} className={cn(index > 0 && "border-line border-t")}>
              <button
                type="button"
                onClick={() => setStage(option.value)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3.5 text-left",
                  selected && "bg-selection/60",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-sm font-semibold",
                    selected ? "text-primary" : "text-muted-foreground/80 dark:text-muted-foreground",
                  )}
                >
                  {selected ? ">" : index + 1}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-option text-foreground text-sm">{option.label}</span>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      selected
                        ? "text-foreground/70 dark:text-foreground"
                        : "text-muted-foreground/80 dark:text-muted-foreground",
                    )}
                  >
                    {index + 1}단계: {option.stageName}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
