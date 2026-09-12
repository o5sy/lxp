import { describe, expect, it } from "vitest";

import { resolveFeedbackStreamEvent } from "./request-feedback";

describe("resolveFeedbackStreamEvent", () => {
  it("feedback-delta 이벤트는 delta 액션으로 변환한다", () => {
    expect(resolveFeedbackStreamEvent("feedback-delta", "안녕")).toEqual({
      type: "feedback-delta",
      delta: "안녕",
    });
  });

  it("verdict 이벤트는 JSON을 파싱해 criteriaChecks 액션으로 변환한다", () => {
    const criteriaChecks = [{ criterion: "버튼 클릭 시 카운트 증가", met: true }];

    expect(resolveFeedbackStreamEvent("verdict", JSON.stringify({ criteriaChecks }))).toEqual({
      type: "verdict",
      criteriaChecks,
    });
  });

  it("error 이벤트는 error 액션으로 변환한다", () => {
    expect(resolveFeedbackStreamEvent("error", "실패 사유")).toEqual({
      type: "error",
      message: "실패 사유",
    });
  });

  it("done 이벤트는 done 액션으로 변환한다", () => {
    expect(resolveFeedbackStreamEvent("done", "")).toEqual({ type: "done" });
  });

  it("알 수 없는 이벤트 타입은 null을 반환한다", () => {
    expect(resolveFeedbackStreamEvent("unknown", "data")).toBeNull();
  });
});
