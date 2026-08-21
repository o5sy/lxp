export function InstructionPanel() {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <p className="text-faint mb-3 font-mono text-xs tracking-wide uppercase">instructions</p>
      <p className="text-muted-foreground mb-2 font-mono text-xs tracking-wide uppercase">
        # 이벤트 버블링 · 연결하기 단계
      </p>
      <p className="text-muted-foreground text-sm">
        실습 지시가 생성되면 여기에 스트리밍으로 표시됩니다.
      </p>
    </div>
  );
}
