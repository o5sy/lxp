"use client";

import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";

import { FeedbackPanel } from "@/features/feedback-panel/components/feedback-panel";

const PLACEHOLDER_CODE = "// 실습을 생성하는 중입니다...\nexport default function App() {\n  return null;\n}\n";
const INITIAL_FILES = { "/App.js": PLACEHOLDER_CODE };

export function SandpackSession() {
  return (
    <SandpackProvider template="react" files={INITIAL_FILES}>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-line flex-1 overflow-hidden border-b">
          <SandpackLayout style={{ height: "100%" }}>
            <SandpackCodeEditor showLineNumbers style={{ height: "100%" }} />
            <SandpackPreview style={{ height: "100%" }} />
          </SandpackLayout>
        </div>
        <div className="h-[220px] shrink-0">
          <FeedbackPanel />
        </div>
      </div>
    </SandpackProvider>
  );
}
