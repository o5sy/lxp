import { TerminalWindow } from "@/shared/ui/terminal-window";

export function PracticeEditorPanel() {
  return (
    <TerminalWindow
      title="practice.tsx — sandpack"
      bodyClassName="items-center justify-center gap-3 bg-sunken p-8"
    >
      <p className="text-faint font-mono text-xs">
        {"// 실습을 생성하면 여기에 코드가 채워집니다"}
      </p>
      <p className="text-muted-foreground max-w-xs text-center text-sm">
        개념을 선택하고 실습을 생성하면 Sandpack 에디터와 실행 결과가 이 영역에 나타납니다.
      </p>
    </TerminalWindow>
  );
}
