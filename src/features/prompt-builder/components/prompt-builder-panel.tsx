import { TerminalWindow } from "@/shared/ui/terminal-window";

export function PromptBuilderPanel() {
  return (
    <TerminalWindow title="prompt-builder — step 1 of 4" bodyClassName="gap-6 p-8">
      <p className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
        # step 1 of 4
      </p>
      <h2 className="font-heading text-foreground text-2xl italic">오늘 배운 개념을 골라주세요</h2>
      <p className="text-muted-foreground max-w-sm text-sm">
        개념/기술명을 입력하면 자주 나오는 항목이 자동완성으로 제안됩니다. 목록에 없어도 직접
        입력해서 제출할 수 있어요.
      </p>
      <p className="text-faint font-mono text-xs">[■□□□] 0%</p>
    </TerminalWindow>
  );
}
