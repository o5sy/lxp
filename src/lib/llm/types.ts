import { z } from "zod";

import type { PcmlStage } from "@/store/prompt-builder-store";

export const practiceGenerationSchema = z.object({
  instruction: z.string().describe("마크다운 형식의 실습 지시문. 정답 코드나 완성된 구현은 포함하지 않는다."),
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
