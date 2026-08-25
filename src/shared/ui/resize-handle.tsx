"use client";

import type { PointerEvent } from "react";

import { cn } from "@/shared/lib/utils";

type ResizeHandleProps = {
  axis: "horizontal" | "vertical";
  isDragging: boolean;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
};

export function ResizeHandle({ axis, isDragging, onPointerDown, onPointerMove, onPointerUp }: ResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation={axis === "horizontal" ? "vertical" : "horizontal"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={cn(
        "group relative shrink-0 touch-none",
        axis === "horizontal" ? "w-2 cursor-col-resize" : "h-2 cursor-row-resize",
      )}
    >
      <div
        className={cn(
          "bg-line absolute rounded-full transition-colors group-hover:bg-primary",
          isDragging && "bg-primary",
          axis === "horizontal"
            ? "top-0 bottom-0 left-1/2 w-px -translate-x-1/2"
            : "top-1/2 right-0 left-0 h-px -translate-y-1/2",
        )}
      />
    </div>
  );
}
