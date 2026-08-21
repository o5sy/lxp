import Link from "next/link";

export function PromptBuilderPanel() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-faint font-mono text-xs">concept</p>
      <h2 className="font-heading text-foreground text-[26px] italic">
        오늘 배운 개념을 골라주세요
      </h2>
      <p className="text-muted-foreground max-w-md text-sm">
        개념/기술명을 입력하면 자주 나오는 항목이 자동완성으로 제안됩니다. 목록에 없어도 직접
        입력해서 제출할 수 있어요.
      </p>
      {/* TODO: 자동완성 하이브리드 입력 로직 구현 전까지의 자리표시자 */}
      <div className="focus-within:border-primary border-line bg-sunken flex items-center gap-2.5 rounded-md border px-4.5 py-4">
        <span className="text-primary font-mono text-xl font-semibold">&gt;</span>
        <input
          type="text"
          disabled
          placeholder="배운 기술/개념을 짧게 입력하세요 (예: useEffect, 이벤트 버블링)"
          className="placeholder:text-faint w-full bg-transparent font-mono text-base outline-none disabled:cursor-not-allowed"
        />
      </div>
      <div className="mt-1 flex justify-end">
        {/* TODO: 4스텝 실제 입력 로직 구현 전까지의 임시 이동 링크 */}
        <Link
          href="/practice/demo"
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 font-mono text-xs font-medium"
        >
          다음 →
        </Link>
      </div>
    </div>
  );
}
