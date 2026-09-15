import { describe, expect, it } from "vitest";

import { resolvePracticeStreamEvent } from "./generate-practice";

describe("resolvePracticeStreamEvent", () => {
  it("instruction-delta 이벤트는 delta 액션으로 변환한다", () => {
    expect(resolvePracticeStreamEvent("instruction-delta", "안녕")).toEqual({
      type: "instruction-delta",
      delta: "안녕",
    });
  });

  it("code 이벤트는 code 액션으로 변환한다", () => {
    expect(resolvePracticeStreamEvent("code", "export default function App() {}")).toEqual({
      type: "code",
      code: "export default function App() {}",
    });
  });

  it("error 이벤트는 error 액션으로 변환한다", () => {
    expect(resolvePracticeStreamEvent("error", "실패 사유")).toEqual({
      type: "error",
      message: "실패 사유",
    });
  });

  it("done 이벤트는 done 액션으로 변환한다", () => {
    expect(resolvePracticeStreamEvent("done", "")).toEqual({ type: "done" });
  });

  it("알 수 없는 이벤트 타입은 null을 반환한다", () => {
    expect(resolvePracticeStreamEvent("unknown", "data")).toBeNull();
  });
});
