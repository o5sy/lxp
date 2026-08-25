"use client";

import { SandpackCodeEditor, SandpackPreview, SandpackProvider, useSandpack } from "@codesandbox/sandpack-react";
import { useEffect, useRef } from "react";

import { FeedbackPanel } from "@/features/feedback-panel/components/feedback-panel";
import { useResizablePanel } from "@/shared/hooks/use-resizable-panel";
import { ResizeHandle } from "@/shared/ui/resize-handle";
import { usePromptBuilderStore } from "@/store/prompt-builder-store";

const PLACEHOLDER_CODE = "// 실습을 생성하는 중입니다...\nexport default function App() {\n  return null;\n}\n";
const INITIAL_FILES = { "/App.js": PLACEHOLDER_CODE };

function CodeSync() {
  const { sandpack } = useSandpack();
  const starterCode = usePromptBuilderStore((state) => state.starterCode);
  const updateFileRef = useRef(sandpack.updateFile);

  useEffect(() => {
    updateFileRef.current = sandpack.updateFile;
  });

  useEffect(() => {
    if (starterCode) {
      updateFileRef.current("/App.js", starterCode);
    }
  }, [starterCode]);

  return null;
}

export function SandpackSession() {
  const generationStatus = usePromptBuilderStore((state) => state.generationStatus);
  const starterCode = usePromptBuilderStore((state) => state.starterCode);

  const editorPane = useResizablePanel({ axis: "horizontal", initialSize: 480, min: 280, max: 900 });
  const feedbackPane = useResizablePanel({ axis: "vertical", initialSize: 220, min: 140, max: 480, reverse: true });

  return (
    <SandpackProvider
      template="react"
      files={INITIAL_FILES}
      className="sandpack-session-wrapper flex min-w-0 flex-1 flex-col overflow-hidden"
    >
      <CodeSync />
      <div className="border-line relative flex min-h-0 flex-1 overflow-hidden border-b">
        <div style={{ width: editorPane.size }} className="min-w-0 shrink-0 overflow-hidden">
          <SandpackCodeEditor
            showLineNumbers
            readOnly={!starterCode}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
        <ResizeHandle
          axis="horizontal"
          isDragging={editorPane.isDragging}
          onPointerDown={editorPane.handlePointerDown}
          onPointerMove={editorPane.handlePointerMove}
          onPointerUp={editorPane.handlePointerUp}
        />
        <div className="min-w-0 flex-1 overflow-hidden">
          <SandpackPreview style={{ height: "100%", width: "100%" }} />
        </div>
        {!starterCode && (
          <div className="bg-sunken/90 absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              {generationStatus === "error" ? "실습 생성에 실패했습니다." : "실습을 생성하는 중입니다..."}
            </p>
          </div>
        )}
      </div>
      <ResizeHandle
        axis="vertical"
        isDragging={feedbackPane.isDragging}
        onPointerDown={feedbackPane.handlePointerDown}
        onPointerMove={feedbackPane.handlePointerMove}
        onPointerUp={feedbackPane.handlePointerUp}
      />
      <div style={{ height: feedbackPane.size }} className="shrink-0 overflow-hidden">
        <FeedbackPanel />
      </div>
    </SandpackProvider>
  );
}
