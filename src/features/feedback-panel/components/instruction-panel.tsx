"use client";

import { PCML_STAGES } from "@/features/prompt-builder/lib/options";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export function InstructionPanel() {
  const concept = usePromptBuilderStore((state) => state.concept);
  const stage = usePromptBuilderStore((state) => state.stage);
  const situationTags = usePromptBuilderStore((state) => state.situationTags);
  const freeText = usePromptBuilderStore((state) => state.freeText);

  const stageOption = PCML_STAGES.find((option) => option.value === stage);
  const summary = [concept, stageOption && `${stageOption.stageName} 단계`, ...situationTags]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <p className="text-faint mb-3 font-mono text-xs tracking-wide uppercase">instructions</p>
      <p className="text-muted-foreground mb-2 font-mono text-xs tracking-wide uppercase">
        # {summary || "실습을 생성하지 않은 상태입니다"}
      </p>
      {freeText && <p className="text-muted-foreground mb-2 text-sm">&ldquo;{freeText}&rdquo;</p>}
      <p className="text-muted-foreground text-sm">
        실습 지시가 생성되면 여기에 스트리밍으로 표시됩니다.
      </p>
    </div>
  );
}
