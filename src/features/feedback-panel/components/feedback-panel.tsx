import { TerminalWindow } from "@/shared/ui/terminal-window";

export function FeedbackPanel() {
  return (
    <TerminalWindow title="ai-feedback" bodyClassName="justify-between gap-4 p-6">
      <p className="text-muted-foreground text-sm">
        실습이 생성되면 AI 지시가 여기에 스트리밍으로 표시됩니다.
      </p>
      <button
        type="button"
        disabled
        className="border-line text-faint rounded-sm border px-4 py-2 font-mono text-xs disabled:cursor-not-allowed"
      >
        코드 확인받기
      </button>
    </TerminalWindow>
  );
}
