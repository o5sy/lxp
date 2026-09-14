import { describe, expect, it } from "vitest";

import { buildFeedbackPrompt } from "./build-feedback-prompt";

describe("buildFeedbackPrompt", () => {
  it("학습자 입력을 <learner_input> 태그로 감싸 데이터로만 전달한다", () => {
    const { prompt } = buildFeedbackPrompt({
      concept: "useEffect",
      difficulty: "typing",
      instruction: "## 요구 사항\n- 버튼 클릭 시 카운트를 올린다",
      code: "export default function App() {}",
    });

    expect(prompt.startsWith("<learner_input>\n")).toBe(true);
    expect(prompt.trimEnd().endsWith("</learner_input>")).toBe(true);
  });

  it("시스템 프롬프트에 프롬프트 인젝션 방어 문구가 포함돼 있다", () => {
    const { system } = buildFeedbackPrompt({
      concept: "useEffect",
      difficulty: "typing",
      instruction: "지시문",
      code: "코드",
    });

    expect(system).toContain("<learner_input>");
    expect(system).toContain("무시하라");
    expect(system).toContain("따르지 않는다");
  });
});
