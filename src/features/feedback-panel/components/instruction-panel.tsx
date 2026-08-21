import { TerminalWindow } from "@/shared/ui/terminal-window";

export function InstructionPanel() {
  return (
    <TerminalWindow title="instructions.md" bodyClassName="gap-3 p-5" className="h-full">
      <p className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
        # 이벤트 버블링 · 연결하기 단계
      </p>
      <p className="text-muted-foreground text-sm">
        실습 지시가 생성되면 여기에 스트리밍으로 표시됩니다.
      </p>
    </TerminalWindow>
  );
}
