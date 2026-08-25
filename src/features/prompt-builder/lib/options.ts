import type { PracticeDifficulty } from "@/store/prompt-builder-store";

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

export const PRACTICE_DIFFICULTIES: {
  value: PracticeDifficulty;
  title: string;
  description: string;
}[] = [
  {
    value: "typing",
    title: "이해",
    description: "문법과 주요 사용법(API)에 익숙해지기",
  },
  {
    value: "apply",
    title: "적용",
    description: "배운 개념 1개를 실전에 사용해보기",
  },
  {
    value: "stretch",
    title: "종합",
    description: "배운 개념을 포함해 여러 지식이 필요한 요구사항 구현해보기",
  },
];

export const BUILDER_STEP_LABELS = ["개념 선택", "목표 선택", "추가 설명"];
