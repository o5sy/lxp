export function FeedbackPanel() {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <p className="text-faint mb-2 font-mono text-xs tracking-wide uppercase">ai-feedback</p>
      <p className="text-muted-foreground text-sm">
        실습이 생성되면 AI 피드백이 여기에 스트리밍으로 표시됩니다.
      </p>
    </div>
  );
}
