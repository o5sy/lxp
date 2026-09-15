import { CONCEPT_SUGGESTIONS } from "@/features/prompt-builder/lib/options";

// isLocallyRecognized는 "타이핑한 텍스트가 키워드를 완전히 포함하는지"로 매치하므로,
// 여기 넣는 단어는 그 자체로 의미가 끝나는 구체적인 개념명이어야 한다. "event"/"state"/
// "dom"처럼 짧고 흔한 단어를 넣으면 "eventloop", "prevent"처럼 우연히 그 글자를 포함한
// 뒷부분 타이핑 중에도 계속 "인식됨"으로 들러붙어 있게 된다("이벤트 루프"를 이어서
// 치는 중에도 "event" 매치가 안 풀리는 문제로 실제 발견됨).
export const FRONTEND_CONCEPT_KEYWORDS: string[] = [
  ...CONCEPT_SUGGESTIONS,
  "리액트",
  "react",
  "훅",
  "hook",
  "props",
  "컴포넌트",
  "component",
  "html",
  "css",
  "javascript",
  "자바스크립트",
  "타입스크립트",
  "typescript",
  "웹팩",
  "bundler",
  "번들러",
  "렌더링",
  "render",
  "가상돔",
  "virtual dom",
  "라이프사이클",
  "lifecycle",
  "context api",
  "컨텍스트",
];
