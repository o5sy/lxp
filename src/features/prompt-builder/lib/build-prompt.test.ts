import { describe, expect, it } from "vitest";

import { buildPracticePrompt } from "./build-prompt";

describe("buildPracticePrompt", () => {
  it("학습자 입력을 <learner_input> 태그로 감싸 데이터로만 전달한다", () => {
    const { prompt } = buildPracticePrompt({
      concept: "useEffect",
      difficulty: "typing",
      freeText: "",
    });

    expect(prompt.startsWith("<learner_input>\n")).toBe(true);
    expect(prompt.trimEnd().endsWith("</learner_input>")).toBe(true);
  });

  it("시스템 프롬프트에 프롬프트 인젝션 방어 문구가 포함돼 있다", () => {
    const { system } = buildPracticePrompt({
      concept: "useEffect",
      difficulty: "typing",
      freeText: "",
    });

    expect(system).toContain("<learner_input>");
    expect(system).toContain("무시하라");
    expect(system).toContain("따르지 않는다");
  });
});
