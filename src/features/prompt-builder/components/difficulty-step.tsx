"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";

import { PRACTICE_DIFFICULTIES } from "@/features/prompt-builder/lib/options";
import { cn } from "@/shared/lib/utils";
import { type PracticeDifficulty, usePromptBuilderStore } from "@/store/prompt-builder-store";

export function DifficultyStep() {
  const difficulty = usePromptBuilderStore((state) => state.difficulty);
  const setDifficulty = usePromptBuilderStore((state) => state.setDifficulty);

  return (
    <div className="flex flex-col gap-3">
      <p id="difficulty-step-label" className="text-faint font-mono text-xs">
        goal
      </p>
      <h2 className="font-heading text-foreground text-[26px] italic">
        이번 실습에서 뭘 목표로 해볼까요?
      </h2>
      <p className="text-muted-foreground max-w-md text-sm">
        가장 끌리는 목표 하나를 골라주세요. 정답은 없어요.
      </p>
      <RadioGroup
        aria-labelledby="difficulty-step-label"
        value={difficulty}
        onValueChange={(value) => setDifficulty(value as PracticeDifficulty)}
        className="border-line bg-card overflow-hidden rounded-md border"
      >
        {PRACTICE_DIFFICULTIES.map((option, index) => {
          const selected = difficulty === option.value;
          return (
            <div key={option.value} className={cn(index > 0 && "border-line border-t")}>
              <Radio.Root
                value={option.value}
                nativeButton
                render={<button type="button" />}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left",
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
                  <span className="font-option text-foreground text-sm font-semibold">
                    {option.title}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      selected
                        ? "text-foreground/70 dark:text-foreground"
                        : "text-muted-foreground/80 dark:text-muted-foreground",
                    )}
                  >
                    {option.description}
                  </span>
                </span>
              </Radio.Root>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
