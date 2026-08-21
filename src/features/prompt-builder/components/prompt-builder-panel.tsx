import Link from "next/link";

import { TerminalWindow } from "@/shared/ui/terminal-window";

export function PromptBuilderPanel() {
  return (
    <TerminalWindow title="prompt-builder" bodyClassName="gap-4 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-foreground text-2xl italic">
          오늘 배운 개념을 골라주세요
        </h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          개념/기술명을 입력하면 자주 나오는 항목이 자동완성으로 제안됩니다. 목록에 없어도 직접
          입력해서 제출할 수 있어요.
        </p>
      </div>
      {/* TODO: 자동완성 하이브리드 입력 로직 구현 전까지의 자리표시자 */}
      <input
        type="text"
        disabled
        placeholder="배운 기술/개념을 짧게 입력하세요 (예: useEffect, 이벤트 버블링)"
        className="border-line placeholder:text-faint w-full rounded-sm border bg-transparent px-3 py-2 font-mono text-sm disabled:cursor-not-allowed"
      />
      <div className="flex justify-end">
        {/* TODO: 4스텝 실제 입력 로직 구현 전까지의 임시 이동 링크 */}
        <Link
          href="/practice/demo"
          className="bg-primary text-primary-foreground rounded-sm px-4 py-2 font-mono text-xs font-medium"
        >
          다음 →
        </Link>
      </div>
    </TerminalWindow>
  );
}
