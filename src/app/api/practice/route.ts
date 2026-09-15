import { generateObject, streamObject } from "ai";

import { isLocallyRecognized } from "@/features/prompt-builder/data/concept-whitelist";
import { buildConceptCheckPrompt, buildPracticePrompt } from "@/features/prompt-builder/lib/build-prompt";
import { getModel, getValidationModel } from "@/lib/llm";
import { conceptValiditySchema, practiceGenerationSchema, type PracticeGenerationInput } from "@/lib/llm/types";

export const maxDuration = 60;

function sseEvent(event: string, data: string) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// 모델이 이미 정확한 입력을 "자기 자신"으로 제안하는 경우가 있다(예: 이미 정확한
// "useSuspenseQuery"를 입력했는데 suggestedCorrection에 똑같이 "useSuspenseQuery"를
// 채움). 이런 무의미한 제안을 보정 제안으로 취급하면, 사용자가 제안을 눌러도 값이
// 그대로라 화면이 진행 안 되는 것처럼 보인다 - 실제로 다른 값을 제안할 때만 인정한다.
function isRealSuggestion(suggestion: string | undefined, original: string): suggestion is string {
  if (!suggestion) return false;
  const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "");
  return normalize(suggestion) !== normalize(original);
}

function toFriendlyErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (/fetch failed|network|ECONNRESET|ETIMEDOUT/i.test(message)) {
    return "네트워크 연결이 불안정해요. 잠시 후 다시 시도해주세요.";
  }
  if (/rate limit|429|quota/i.test(message)) {
    return "요청이 몰려 잠시 처리가 지연되고 있어요. 잠시 후 다시 시도해주세요.";
  }
  if (/JSON|parse|schema|validation/i.test(message)) {
    return "실습 생성 결과를 처리하지 못했어요. 다시 시도해주세요.";
  }
  return "실습 생성에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

export async function POST(request: Request) {
  const input = (await request.json()) as PracticeGenerationInput;

  if (!input.concept?.trim() || !input.difficulty) {
    return new Response("concept과 difficulty는 필수입니다.", { status: 400 });
  }

  const locallyRecognized = isLocallyRecognized(input.concept);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        if (input.checkOnly) {
          // 1단계 사전 판별: 실습 본문은 필요 없으니 경량 모델 + 축소 스키마 +
          // 짧은 전용 프롬프트(지시문/시작코드 작성 규칙 등 판별에 무관한
          // 내용 제외)로 받는다. 스트리밍이 필요 없고(전체 결과가 짧다),
          // gemini-flash-lite 계열은 streamObject와 조합 시 응답이 멈추는
          // 문제가 있어 generateObject(non-streaming)를 쓴다.
          const { system, prompt } = buildConceptCheckPrompt(input.concept);
          const { object: final } = await generateObject({
            model: getValidationModel(),
            schema: conceptValiditySchema,
            system,
            prompt,
          });
          if (isRealSuggestion(final.suggestedCorrection, input.concept)) {
            // 오타/축약형으로 보이는 경우 - 거부가 아니라 정확한 이름을 제안한다.
            controller.enqueue(encoder.encode(sseEvent("suggestion", final.suggestedCorrection)));
          } else if (final.suggestedCorrection) {
            // 모델이 입력과 똑같은 값을 "제안"으로 준 경우 - 실질적으로는 유효하다는
            // 뜻이므로 그대로 통과시킨다(reason이 비어있을 수 있어 rejected로
            // 보내면 빈 메시지만 뜬다).
            controller.enqueue(encoder.encode(sseEvent("done", "")));
          } else if (final.status === "invalid" && !locallyRecognized) {
            controller.enqueue(
              encoder.encode(sseEvent("rejected", final.reason || "이 개념은 코드 실습으로 만들기 어려워요.")),
            );
          } else {
            controller.enqueue(encoder.encode(sseEvent("done", "")));
          }
        } else {
          const { system, prompt } = buildPracticePrompt(input);
          let sentInstructionLength = 0;
          const result = streamObject({
            model: getModel(),
            schema: practiceGenerationSchema,
            system,
            prompt,
          });

          for await (const partial of result.partialObjectStream) {
            // 로컬 화이트리스트에 명백히 매치된 개념은 모델이 잘못 invalid로
            // 판정하더라도 신뢰하지 않고 계속 instruction을 스트리밍한다.
            if (partial.status === "invalid" && !locallyRecognized) continue;

            const instruction = partial.instruction ?? "";
            if (instruction.length > sentInstructionLength) {
              const delta = instruction.slice(sentInstructionLength);
              sentInstructionLength = instruction.length;
              controller.enqueue(encoder.encode(sseEvent("instruction-delta", delta)));
            }
          }

          const final = await result.object;
          const rejected = final.status === "invalid" && !locallyRecognized;

          if (isRealSuggestion(final.suggestedCorrection, input.concept)) {
            controller.enqueue(encoder.encode(sseEvent("suggestion", final.suggestedCorrection)));
          } else if (rejected && !final.suggestedCorrection) {
            controller.enqueue(
              encoder.encode(sseEvent("rejected", final.reason || "이 개념은 코드 실습으로 만들기 어려워요.")),
            );
          } else {
            const instruction = final.instruction ?? "";
            if (instruction.length > sentInstructionLength) {
              controller.enqueue(encoder.encode(sseEvent("instruction-delta", instruction.slice(sentInstructionLength))));
            }
            controller.enqueue(encoder.encode(sseEvent("code", final.starterCode ?? "")));
            controller.enqueue(encoder.encode(sseEvent("done", "")));
          }
        }
      } catch (error) {
        controller.enqueue(encoder.encode(sseEvent("error", toFriendlyErrorMessage(error))));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
