"use client";

import { usePromptBuilderStore } from "@/store/prompt-builder-store";

export function DetailStep() {
  const freeText = usePromptBuilderStore((state) => state.freeText);
  const setFreeText = usePromptBuilderStore((state) => state.setFreeText);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-faint font-mono text-xs">detail (선택)</p>
      <h2 className="font-heading text-foreground text-[26px] italic">
        더 구체적으로 알려줄 게 있다면
      </h2>
      <p className="text-muted-foreground max-w-md text-sm">
        위 선택지로 충분하다면 비워두고 바로 실습을 생성해도 괜찮아요.
      </p>
      <div className="focus-within:border-primary border-line bg-sunken flex items-center gap-2.5 rounded-md border px-4.5 py-4">
        <span className="text-primary font-mono text-xl font-semibold">&gt;</span>
        <input
          type="text"
          value={freeText}
          onChange={(event) => setFreeText(event.target.value)}
          placeholder="예: 특히 조건문이랑 같이 쓸 때 헷갈려요 (선택)"
          className="placeholder:text-faint w-full bg-transparent font-mono text-base outline-none"
        />
      </div>
    </div>
  );
}
