import { z } from "zod";

import type { PcmlStage } from "@/store/prompt-builder-store";

export const practiceGenerationSchema = z.object({
  instruction: z
    .string()
    .describe(
      "마크다운 형식의 실습 지시문. 순서와 제목을 그대로 따른다: (1) 헤딩 없는 개요(핵심 개념과 목적을 2~3문장으로, 문장마다 빈 줄로 구분된 별도 문단으로), (2) '## 실습 목표', (3) '## 요구 사항', (4) '## 완료 기준'. 정답 코드나 완성된 구현은 포함하지 않는다.",
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

export const feedbackSchema = z.object({
  feedback: z
    .string()
    .describe(
      "마크다운 형식의 피드백 본문. 정답을 바로 알려주지 않고, 코드를 관찰한 결과를 해석해서 설명하고 학습자가 스스로 확인해볼 예측 질문을 던진다.",
    ),
  criteriaMet: z.boolean().describe("실습 지시문의 '완료 기준' 섹션을 학습자의 코드가 충족했는지 여부."),
  unmetReasons: z
    .array(z.string())
    .optional()
    .describe("criteriaMet이 false일 때만: 충족하지 못한 기준을 짧은 문장으로 나열. 고치는 방법은 포함하지 않는다."),
});

export type Feedback = z.infer<typeof feedbackSchema>;
