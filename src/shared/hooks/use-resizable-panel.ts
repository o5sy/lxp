"use client";

import { useCallback, useRef, useState } from "react";

type ResizeAxis = "horizontal" | "vertical";

type UseResizablePanelOptions = {
  axis: ResizeAxis;
  initialSize: number;
  min: number;
  max: number;
  /** true면 드래그 방향과 크기 변화 방향이 반대 (예: 패널이 오른쪽/아래에 있어 핸들을 반대로 밀어야 커지는 경우) */
  reverse?: boolean;
};

export function useResizablePanel({ axis, initialSize, min, max, reverse = false }: UseResizablePanelOptions) {
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ pos: 0, size: initialSize });

  const clamp = useCallback((value: number) => Math.min(max, Math.max(min, value)), [min, max]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStartRef.current = { pos: axis === "horizontal" ? event.clientX : event.clientY, size };
      setIsDragging(true);
      document.body.style.cursor = axis === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
    },
    [axis, size],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      const pos = axis === "horizontal" ? event.clientX : event.clientY;
      const delta = pos - dragStartRef.current.pos;
      setSize(clamp(dragStartRef.current.size + (reverse ? -delta : delta)));
    },
    [axis, clamp, reverse],
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  return { size, isDragging, handlePointerDown, handlePointerMove, handlePointerUp };
}
