import type { PcmlStage } from "@/store/prompt-builder-store";

export const CONCEPT_SUGGESTIONS = [
  "useEffect",
  "useState",
  "useMemo",
  "useCallback",
  "이벤트 버블링",
  "이벤트 캡처링",
  "배열 메서드",
  "구조 분해 할당",
  "클로저",
  "스코프",
  "호이스팅",
  "프로토타입",
  "비동기 처리",
  "Promise",
  "async/await",
  "이벤트 루프",
  "조건부 렌더링",
  "리스트 렌더링",
  "props drilling",
  "컴포넌트 합성",
  "제어 컴포넌트",
  "폼 유효성 검사",
  "라우팅",
  "CSS flexbox",
  "CSS grid",
  "반응형 디자인",
  "API 호출",
  "상태 관리",
  "재렌더링",
  "메모이제이션",
];

export const PCML_STAGES: {
  value: PcmlStage;
  label: string;
  stageName: string;
}[] = [
  { value: "recall", label: "다시 설명 들으면 이해 가능", stageName: "익숙해지기" },
  { value: "apply", label: "혼자 적용해볼 수 있음", stageName: "연결하기" },
  { value: "explain", label: "다른 사람에게 설명 가능", stageName: "판단하기" },
];

export const SITUATION_TAGS = [
  "문법은 아는데 언제 쓰는지 모르겠어요",
  "코드가 자꾸 에러나요",
  "설명을 들어도 이해가 잘 안 가요",
  "이미 아는데 연습만 더 하고 싶어요",
];

export const BUILDER_STEP_LABELS = ["개념 선택", "학습 단계 선택", "상황 선택", "추가 설명"];
