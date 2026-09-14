import { beforeEach, describe, expect, it } from "vitest";

import { TOTAL_BUILDER_STEPS, usePromptBuilderStore } from "./prompt-builder-store";

function resetStore() {
  usePromptBuilderStore.setState(usePromptBuilderStore.getInitialState(), true);
}

beforeEach(() => {
  resetStore();
});

describe("goNext / goBack", () => {
  it("goNext는 TOTAL_BUILDER_STEPS를 넘어가지 않는다", () => {
    const { goNext } = usePromptBuilderStore.getState();

    for (let i = 0; i < TOTAL_BUILDER_STEPS + 5; i += 1) {
      goNext();
    }

    expect(usePromptBuilderStore.getState().step).toBe(TOTAL_BUILDER_STEPS);
  });

  it("goBack은 1 아래로 내려가지 않는다", () => {
    const { goBack } = usePromptBuilderStore.getState();

    for (let i = 0; i < 5; i += 1) {
      goBack();
    }

    expect(usePromptBuilderStore.getState().step).toBe(1);
  });
});

describe("reset", () => {
  it("concept/difficulty/freeText/step을 모두 초기값으로 되돌린다", () => {
    const { setConcept, setDifficulty, setFreeText, goNext, reset } =
      usePromptBuilderStore.getState();

    setConcept("useEffect");
    setDifficulty("apply");
    setFreeText("추가 설명");
    goNext();

    reset();

    expect(usePromptBuilderStore.getState()).toMatchObject({
      step: 1,
      concept: "",
      difficulty: null,
      freeText: "",
    });
  });
});

describe("피드백 라운드", () => {
  it("startFeedback은 빈 라운드를 새로 추가한다", () => {
    usePromptBuilderStore.getState().startFeedback();

    expect(usePromptBuilderStore.getState().feedbackRounds).toEqual([
      { feedback: "", criteriaChecks: null },
    ]);
  });

  it("appendFeedback은 델타를 누적한다", () => {
    const { startFeedback, appendFeedback } = usePromptBuilderStore.getState();

    startFeedback();
    appendFeedback("안");
    appendFeedback("녕");

    expect(usePromptBuilderStore.getState().feedbackRounds[0].feedback).toBe("안녕");
  });

  it("setFeedbackVerdict는 마지막 라운드의 criteriaChecks를 채운다", () => {
    const { startFeedback, setFeedbackVerdict } = usePromptBuilderStore.getState();
    const criteriaChecks = [{ criterion: "버튼 클릭 시 카운트 증가", met: true }];

    startFeedback();
    setFeedbackVerdict(criteriaChecks);

    expect(usePromptBuilderStore.getState().feedbackRounds[0].criteriaChecks).toEqual(
      criteriaChecks,
    );
  });

  it("2회차 피드백에서도 append/verdict가 최신 라운드에만 반영되고 1회차 기록은 그대로 남는다", () => {
    const { startFeedback, appendFeedback, setFeedbackVerdict } = usePromptBuilderStore.getState();

    startFeedback();
    appendFeedback("1회차 피드백");
    setFeedbackVerdict([{ criterion: "1회차 기준", met: false }]);

    startFeedback();
    appendFeedback("2회차 피드백");
    setFeedbackVerdict([{ criterion: "2회차 기준", met: true }]);

    const rounds = usePromptBuilderStore.getState().feedbackRounds;

    expect(rounds).toHaveLength(2);
    expect(rounds[0]).toEqual({
      feedback: "1회차 피드백",
      criteriaChecks: [{ criterion: "1회차 기준", met: false }],
    });
    expect(rounds[1]).toEqual({
      feedback: "2회차 피드백",
      criteriaChecks: [{ criterion: "2회차 기준", met: true }],
    });
  });

  it("피드백 없이(빈 라운드) 에러가 나면 그 라운드를 제거한다", () => {
    const { startFeedback, setFeedbackError } = usePromptBuilderStore.getState();

    startFeedback();
    setFeedbackError("네트워크 오류");

    const state = usePromptBuilderStore.getState();
    expect(state.feedbackRounds).toEqual([]);
    expect(state.feedbackStatus).toBe("error");
    expect(state.feedbackError).toBe("네트워크 오류");
  });

  it("이미 내용이 쌓인 라운드에서 에러가 나면 그 라운드를 보존한다", () => {
    const { startFeedback, appendFeedback, setFeedbackError } = usePromptBuilderStore.getState();

    startFeedback();
    appendFeedback("일부만 도착한 피드백");
    setFeedbackError("스트림 중단");

    const state = usePromptBuilderStore.getState();
    expect(state.feedbackRounds).toEqual([
      { feedback: "일부만 도착한 피드백", criteriaChecks: null },
    ]);
  });
});
