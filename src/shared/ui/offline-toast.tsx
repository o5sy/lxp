"use client";

import { useOnlineStatus } from "@/shared/hooks/use-online-status";

// 네트워크 인터페이스가 끊기면(와이파이 끔 등) 브라우저가 페이지 이동 자체를
// 자체 오프라인 에러 화면으로 가로채 버려서, 우리 fetch 에러 처리가 개입할
// 틈이 없는 경우가 있다. 이 배너는 그 틈을 메우는 전역 안내다 - 어느 화면에
// 있든 즉시 보이도록 루트 레이아웃에 마운트한다.
export function OfflineToast() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-line bg-card text-destructive fixed inset-x-0 bottom-4 z-50 mx-auto w-fit rounded-md border px-4 py-2 font-mono text-xs shadow-sm"
    >
      네트워크 연결이 끊겼어요. 연결을 확인해주세요.
    </div>
  );
}
