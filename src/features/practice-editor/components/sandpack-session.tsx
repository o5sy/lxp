"use client";

import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, useSandpack } from "@codesandbox/sandpack-react";
import { useEffect, useRef } from "react";

import { FeedbackPanel } from "@/features/feedback-panel/components/feedback-panel";
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

  return (
    <SandpackProvider
      template="react"
      files={INITIAL_FILES}
      className="flex min-w-0 flex-1 flex-col overflow-hidden"
    >
      <CodeSync />
      <div className="border-line relative min-h-0 flex-1 overflow-hidden border-b">
        <SandpackLayout style={{ height: "100%" }}>
          <SandpackCodeEditor showLineNumbers readOnly={!starterCode} style={{ height: "100%" }} />
          <SandpackPreview style={{ height: "100%" }} />
        </SandpackLayout>
        {!starterCode && (
          <div className="bg-sunken/90 absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              {generationStatus === "error" ? "실습 생성에 실패했습니다." : "실습을 생성하는 중입니다..."}
            </p>
          </div>
        )}
      </div>
      <div className="h-[220px] shrink-0">
        <FeedbackPanel />
      </div>
    </SandpackProvider>
  );
}
