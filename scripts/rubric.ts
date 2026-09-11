import ts from "typescript";

import type { PracticeGenerationInput } from "@/lib/llm/types";

export type CapturedSample = {
  input: PracticeGenerationInput;
  output: {
    instruction: string;
    starterCode: string;
  };
  model: string;
  capturedAt: string;
};

export type RubricCheckResult = {
  id: string;
  description: string;
  severity: "error" | "warning";
  pass: boolean;
  detail?: string;
};

type RubricCheck = {
  id: string;
  description: string;
  severity: "error" | "warning";
  run: (sample: CapturedSample) => { pass: boolean; detail?: string };
};

const REQUIRED_SECTIONS = ["## 실습 목표", "## 요구 사항", "## 완료 기준"];

const FORBIDDEN_COMPLETION_PATTERNS = [
  "console.log",
  "document.title",
  "콘솔",
  "개발자 도구",
  "탭 제목",
];

function splitSections(instruction: string) {
  const headingIndexes = REQUIRED_SECTIONS.map((heading) => instruction.indexOf(heading));
  return headingIndexes;
}

function getSectionBody(instruction: string, heading: string, nextHeading: string | null) {
  const start = instruction.indexOf(heading);
  if (start === -1) return null;
  const bodyStart = start + heading.length;
  const end = nextHeading ? instruction.indexOf(nextHeading, bodyStart) : instruction.length;
  const body = instruction.slice(bodyStart, end === -1 ? instruction.length : end);
  return body.trim();
}

const CHECKS: RubricCheck[] = [
  {
    id: "overview-no-leading-heading",
    description: "지시문 개요는 헤딩 없이 산문으로 시작해야 한다.",
    severity: "error",
    run: (sample) => {
      const trimmed = sample.output.instruction.trimStart();
      const pass = trimmed.length > 0 && !trimmed.startsWith("#");
      return { pass, detail: pass ? undefined : `시작 부분: "${trimmed.slice(0, 40)}..."` };
    },
  },
  {
    id: "overview-paragraph-count",
    description: "첫 헤딩 이전 개요는 빈 줄로 구분된 2~3개 문단이어야 한다.",
    severity: "warning",
    run: (sample) => {
      const firstHeadingIndex = REQUIRED_SECTIONS.map((h) => sample.output.instruction.indexOf(h))
        .filter((i) => i !== -1)
        .sort((a, b) => a - b)[0];
      const overview = (
        firstHeadingIndex === undefined
          ? sample.output.instruction
          : sample.output.instruction.slice(0, firstHeadingIndex)
      ).trim();
      const paragraphs = overview
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      const pass = paragraphs.length >= 2 && paragraphs.length <= 3;
      return { pass, detail: pass ? undefined : `문단 수: ${paragraphs.length}` };
    },
  },
  {
    id: "required-sections-in-order",
    description: "'## 실습 목표' → '## 요구 사항' → '## 완료 기준' 순서로 모두 존재해야 한다.",
    severity: "error",
    run: (sample) => {
      const indexes = splitSections(sample.output.instruction);
      const allPresent = indexes.every((i) => i !== -1);
      const inOrder = allPresent && indexes[0] < indexes[1] && indexes[1] < indexes[2];
      return {
        pass: allPresent && inOrder,
        detail: allPresent ? (inOrder ? undefined : "순서가 어긋남") : "일부 섹션 누락",
      };
    },
  },
  {
    id: "sections-non-empty",
    description: "각 섹션(실습 목표/요구 사항/완료 기준)은 내용이 비어 있으면 안 된다.",
    severity: "error",
    run: (sample) => {
      const empties: string[] = [];
      for (let i = 0; i < REQUIRED_SECTIONS.length; i++) {
        const heading = REQUIRED_SECTIONS[i];
        const nextHeading = REQUIRED_SECTIONS[i + 1] ?? null;
        const body = getSectionBody(sample.output.instruction, heading, nextHeading);
        if (!body) empties.push(heading);
      }
      return { pass: empties.length === 0, detail: empties.length ? `비어있음: ${empties.join(", ")}` : undefined };
    },
  },
  {
    id: "no-invisible-completion-criteria",
    description: "완료 기준은 Sandpack 미리보기 화면 밖에서만 확인 가능한 방법(콘솔, 탭 제목 등)을 쓰면 안 된다.",
    severity: "error",
    run: (sample) => {
      const body =
        getSectionBody(sample.output.instruction, "## 완료 기준", null) ?? sample.output.instruction;
      const hits = FORBIDDEN_COMPLETION_PATTERNS.filter((pattern) => body.includes(pattern));
      return { pass: hits.length === 0, detail: hits.length ? `발견: ${hits.join(", ")}` : undefined };
    },
  },
  {
    id: "no-run-button-language",
    description: "Sandpack은 별도 실행 버튼이 없으므로 '실행 버튼' 관련 문구를 쓰면 안 된다.",
    severity: "error",
    run: (sample) => {
      const pass = !sample.output.instruction.includes("실행 버튼");
      return { pass };
    },
  },
  {
    id: "starter-exports-app-component",
    description: "시작 코드는 App 컴포넌트를 기본 export 해야 한다.",
    severity: "error",
    run: (sample) => {
      const pass = /export\s+default\s+function\s+App\b|export\s+default\s+App\b/.test(sample.output.starterCode);
      return { pass };
    },
  },
  {
    id: "starter-code-parses",
    description: "시작 코드는 JSX 문법 오류 없이 파싱되어야 한다.",
    severity: "error",
    run: (sample) => {
      const sourceFile = ts.createSourceFile(
        "App.jsx",
        sample.output.starterCode,
        ts.ScriptTarget.Latest,
        false,
        ts.ScriptKind.JSX,
      );
      const diagnostics = (sourceFile as unknown as { parseDiagnostics?: unknown[] }).parseDiagnostics ?? [];
      const pass = diagnostics.length === 0;
      return { pass, detail: pass ? undefined : `파싱 오류 ${diagnostics.length}건` };
    },
  },
  {
    id: "starter-has-incomplete-marker",
    description: "시작 코드는 학습자가 채울 부분(TODO 등)을 남겨둬야 한다 — 정답이 이미 채워져 있으면 안 됨.",
    severity: "warning",
    run: (sample) => {
      // 모델이 "TODO"뿐 아니라 "// 요구사항 1: ... 추가"처럼 번호를 참조하는 힌트 코멘트도
      // 남기는 경우가 관찰되어(css-flexbox 샘플), 두 형태 모두 인정한다.
      const pass = /TODO|작성하세요|구현하세요|완성하세요|채우세요|추가하세요|요구사항\s*\d+/.test(
        sample.output.starterCode,
      );
      return { pass };
    },
  },
];

export function runRubric(sample: CapturedSample): RubricCheckResult[] {
  return CHECKS.map((check) => {
    const { pass, detail } = check.run(sample);
    return { id: check.id, description: check.description, severity: check.severity, pass, detail };
  });
}

export const RUBRIC_CHECKS = CHECKS;
