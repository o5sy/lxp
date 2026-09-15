"use client";

import { useEffect, useState } from "react";

// 서버 렌더링 시점엔 navigator가 없으니 true로 시작한다 - 두 경우 다 화면엔
// 아무것도 안 그리므로(OfflineToast는 오프라인일 때만 렌더) 하이드레이션
// 불일치가 생기지 않는다. offline/online 이벤트는 브라우저가 네트워크
// 인터페이스 자체가 끊기는 걸 감지했을 때(와이파이 끔 등) 확실히 발생한다 -
// navigator.onLine처럼 "인터넷이 실제로 되는지"까지는 보장 못하지만, 이
// 프로젝트가 다루는 시나리오(연결 자체가 끊김)에는 충분하다.
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}
