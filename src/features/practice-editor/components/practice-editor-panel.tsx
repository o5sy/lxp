export function PracticeEditorPanel() {
  return (
    <div className="bg-sunken flex h-full flex-col items-center justify-center gap-2 overflow-hidden p-6 text-center">
      <p className="text-faint font-mono text-xs">
        {"// 실습을 생성하면 여기에 코드가 채워집니다"}
      </p>
      <p className="text-muted-foreground max-w-xs text-sm">
        개념을 선택하고 실습을 생성하면 Sandpack 에디터와 실행 결과가 이 영역에 나타납니다.
      </p>
    </div>
  );
}
