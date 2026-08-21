export function FeedbackPanel() {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-line flex shrink-0 items-center justify-between border-b px-4 py-2.5">
        <p className="text-faint font-mono text-xs tracking-wide uppercase">ai-feedback</p>
        <button
          type="button"
          disabled
          className="text-faint border-line rounded-md border px-4 py-1.5 font-mono text-xs disabled:cursor-not-allowed"
        >
          피드백 받기
        </button>
      </div>
      <p className="text-muted-foreground p-4 text-sm">
        실습이 생성되면 AI 피드백이 여기에 스트리밍으로 표시됩니다.
      </p>
    </div>
  );
}
