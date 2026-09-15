import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { generateObject } from "ai";

import { buildPracticePrompt } from "@/features/prompt-builder/lib/build-prompt";
import { getModel } from "@/lib/llm";
import { practiceGenerationSchema, type PracticeGenerationInput } from "@/lib/llm/types";

const FIXTURES_DIR = path.join(process.cwd(), "fixtures", "practice-samples");

// 1차 샘플: typing 난이도 × 3개 개념. rubric을 보정한 뒤 apply/stretch나 다른 개념으로 확장한다.
// 이미 캡처된 조합은 건너뛰므로(아래 idempotent 체크), 나중에 이 배열에 항목을 추가해서
// 재실행해도 기존 조합을 다시 호출하지 않는다.
const SAMPLES_TO_CAPTURE: PracticeGenerationInput[] = [
  { concept: "useState", difficulty: "typing", freeText: "" },
  { concept: "클로저", difficulty: "typing", freeText: "" },
  { concept: "CSS flexbox", difficulty: "typing", freeText: "" },
];

function slugify(input: PracticeGenerationInput) {
  const concept = input.concept
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return `${concept}__${input.difficulty}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureOne(input: PracticeGenerationInput) {
  const { system, prompt } = buildPracticePrompt(input);
  const model = getModel();

  const { object } = await generateObject({
    model,
    schema: practiceGenerationSchema,
    system,
    prompt,
  });

  return {
    input,
    output: {
      status: object.status,
      reason: object.reason,
      suggestedCorrection: object.suggestedCorrection,
      instruction: object.instruction,
      starterCode: object.starterCode,
    },
    model: model.modelId,
    capturedAt: new Date().toISOString(),
  };
}

async function main() {
  await mkdir(FIXTURES_DIR, { recursive: true });

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error(
      "GOOGLE_GENERATIVE_AI_API_KEY가 설정되어 있지 않습니다. .env.local에 키를 추가한 뒤 다시 실행하세요.",
    );
    process.exitCode = 1;
    return;
  }

  for (const input of SAMPLES_TO_CAPTURE) {
    const slug = slugify(input);
    const filePath = path.join(FIXTURES_DIR, `${slug}.json`);

    if (existsSync(filePath)) {
      console.log(`[skip] ${slug} — 이미 캡처됨`);
      continue;
    }

    console.log(`[capture] ${slug} 호출 중...`);
    try {
      const sample = await captureOne(input);
      await writeFile(filePath, JSON.stringify(sample, null, 2) + "\n", "utf-8");
      console.log(`[done] ${slug} → ${path.relative(process.cwd(), filePath)}`);
    } catch (error) {
      console.error(`[error] ${slug} 캡처 실패:`, error instanceof Error ? error.message : error);
      console.error("무료 쿼터 제약을 고려해 여기서 중단합니다. 실패한 조합만 다시 실행하면 됩니다.");
      process.exitCode = 1;
      return;
    }

    // 무료 티어 rate limit을 배려한 짧은 대기.
    await sleep(4000);
  }

  console.log("모든 샘플 캡처 완료.");
}

main();
