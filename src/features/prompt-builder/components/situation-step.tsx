"use client";

import { SITUATION_TAGS } from "@/features/prompt-builder/lib/options";
import { cn } from "@/shared/lib/utils";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export function SituationStep() {
  const situationTags = usePromptBuilderStore((state) => state.situationTags);
  const toggleSituationTag = usePromptBuilderStore((state) => state.toggleSituationTag);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-faint font-mono text-xs">situation</p>
      <h2 className="font-heading text-foreground text-[26px] italic">
        지금 어떤 상황에 가장 가까운가요?
      </h2>
      <p className="text-muted-foreground max-w-md text-sm">
        해당하는 걸 모두 골라주세요. 여러 개 선택할 수 있어요.
      </p>
      <div className="flex flex-wrap gap-2">
        {SITUATION_TAGS.map((tag) => {
          const selected = situationTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleSituationTag(tag)}
              className={cn(
                "font-option rounded-md border px-3.5 py-2 text-left text-sm transition-colors",
                selected
                  ? "bg-selection border-primary text-foreground"
                  : "border-line bg-card text-muted-foreground",
              )}
            >
              {selected ? "✓ " : ""}
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
