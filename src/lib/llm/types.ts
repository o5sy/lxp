import { z } from "zod";

import type { PcmlStage } from "@/store/prompt-builder-store";

export const practiceGenerationSchema = z.object({
  instruction: z
    .string()
    .describe(
      "마크다운 형식의 실습 지시문. 순서와 제목을 그대로 따른다: (1) 헤딩 없는 개요 문단(핵심 개념과 목적을 줄글로 간결하게), (2) '## 실습 목표', (3) '## 요구 사항', (4) '## 완료 기준'. 정답 코드나 완성된 구현은 포함하지 않는다.",
    ),
  starterCode: z.string().describe("학습자가 채워나갈 시작 코드. App.jsx 전체 파일 내용."),
});

export type PracticeGeneration = z.infer<typeof practiceGenerationSchema>;

export type PracticeGenerationInput = {
  concept: string;
  stage: PcmlStage;
  situationTags: string[];
  freeText: string;
};

export type FeedbackInput = {
  concept: string;
  stage: PcmlStage;
  instruction: string;
  code: string;
};
