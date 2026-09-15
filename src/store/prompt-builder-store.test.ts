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

describe("개념 판별(conceptCheck)", () => {
  it("setConcept으로 개념 텍스트가 바뀌면 이전 판별 결과를 초기화한다", () => {
    const { setConcept, setConceptCheckInvalid } = usePromptBuilderStore.getState();

    setConceptCheckInvalid("이 개념은 코드 실습으로 만들기 어려워요");
    setConcept("useEffect");

    const state = usePromptBuilderStore.getState();
    expect(state.conceptCheckStatus).toBe("idle");
    expect(state.conceptCheckReason).toBeNull();
  });

  it("startConceptCheck은 checking 상태로 전환한다", () => {
    usePromptBuilderStore.getState().startConceptCheck();

    expect(usePromptBuilderStore.getState().conceptCheckStatus).toBe("checking");
  });

  it("setConceptCheckInvalid는 invalid 상태와 이유를 함께 저장한다", () => {
    usePromptBuilderStore.getState().setConceptCheckInvalid("코드 실습으로 옮길 수 없어요");

    const state = usePromptBuilderStore.getState();
    expect(state.conceptCheckStatus).toBe("invalid");
    expect(state.conceptCheckReason).toBe("코드 실습으로 옮길 수 없어요");
  });

  it("setConceptCheckValid는 valid 상태로 전환하고 이유를 지운다", () => {
    const { setConceptCheckInvalid, setConceptCheckValid } = usePromptBuilderStore.getState();

    setConceptCheckInvalid("일단 거부된 상태");
    setConceptCheckValid();

    const state = usePromptBuilderStore.getState();
    expect(state.conceptCheckStatus).toBe("valid");
    expect(state.conceptCheckReason).toBeNull();
  });

  it("returnToConceptStep은 1단계로 돌아가고 판별 상태를 초기화한다", () => {
    const { goNext, setConceptCheckInvalid, returnToConceptStep } = usePromptBuilderStore.getState();

    goNext();
    goNext();
    setConceptCheckInvalid("거부 사유");
    returnToConceptStep();

    const state = usePromptBuilderStore.getState();
    expect(state.step).toBe(1);
    expect(state.conceptCheckStatus).toBe("idle");
    expect(state.conceptCheckReason).toBeNull();
  });
});

describe("개념 보정 제안(conceptSuggestion)", () => {
  it("setConceptSuggestion은 제안 값을 저장한다", () => {
    usePromptBuilderStore.getState().setConceptSuggestion("useState");

    expect(usePromptBuilderStore.getState().conceptSuggestion).toBe("useState");
  });

  it("setConcept으로 개념 텍스트가 바뀌면 이전 보정 제안도 지운다", () => {
    const { setConceptSuggestion, setConcept } = usePromptBuilderStore.getState();

    setConceptSuggestion("useState");
    setConcept("useEffect");

    expect(usePromptBuilderStore.getState().conceptSuggestion).toBeNull();
  });

  it("returnToConceptStep은 남아있던 보정 제안도 초기화한다", () => {
    const { setConceptSuggestion, returnToConceptStep } = usePromptBuilderStore.getState();

    setConceptSuggestion("useState");
    returnToConceptStep();

    expect(usePromptBuilderStore.getState().conceptSuggestion).toBeNull();
  });

  it("reset은 남아있던 보정 제안도 초기화한다", () => {
    const { setConceptSuggestion, reset } = usePromptBuilderStore.getState();

    setConceptSuggestion("useState");
    reset();

    expect(usePromptBuilderStore.getState().conceptSuggestion).toBeNull();
  });
});

describe("실습 생성(generation) 상태", () => {
  it("setConceptRejected는 generationStatus를 rejected로 바꾸고 이유를 저장한다", () => {
    usePromptBuilderStore.getState().setConceptRejected("이 개념은 부적합해요");

    const state = usePromptBuilderStore.getState();
    expect(state.generationStatus).toBe("rejected");
    expect(state.rejectionReason).toBe("이 개념은 부적합해요");
  });

  it("startGeneration은 이전 거부 사유를 초기화한다", () => {
    const { setConceptRejected, startGeneration } = usePromptBuilderStore.getState();

    setConceptRejected("이전 거부 사유");
    startGeneration();

    const state = usePromptBuilderStore.getState();
    expect(state.generationStatus).toBe("loading");
    expect(state.rejectionReason).toBeNull();
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
