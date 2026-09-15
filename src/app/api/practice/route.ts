import { generateObject, streamObject } from "ai";

import { isLocallyRecognized } from "@/features/prompt-builder/data/concept-whitelist";
import { buildPracticePrompt } from "@/features/prompt-builder/lib/build-prompt";
import { getModel, getValidationModel } from "@/lib/llm";
import { conceptValiditySchema, practiceGenerationSchema, type PracticeGenerationInput } from "@/lib/llm/types";

export const maxDuration = 60;

function sseEvent(event: string, data: string) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
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

  const { system, prompt } = buildPracticePrompt(input);
  const locallyRecognized = isLocallyRecognized(input.concept);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        if (input.checkOnly) {
          // 1단계 사전 판별: 실습 본문은 필요 없으니 경량 모델 + 축소 스키마로
          // 판별 필드만 받는다. 스트리밍이 필요 없고(전체 결과가 짧다),
          // gemini-flash-lite 계열은 streamObject와 조합 시 응답이 멈추는
          // 문제가 있어 generateObject(non-streaming)를 쓴다.
          const { object: final } = await generateObject({
            model: getValidationModel(),
            schema: conceptValiditySchema,
            system,
            prompt,
          });
          if (final.suggestedCorrection) {
            // 오타/축약형으로 보이는 경우 - 거부가 아니라 정확한 이름을 제안한다.
            controller.enqueue(encoder.encode(sseEvent("suggestion", final.suggestedCorrection)));
          } else if (final.status === "invalid" && !locallyRecognized) {
            controller.enqueue(
              encoder.encode(sseEvent("rejected", final.reason || "이 개념은 코드 실습으로 만들기 어려워요.")),
            );
          } else {
            controller.enqueue(encoder.encode(sseEvent("done", "")));
          }
        } else {
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

          if (final.suggestedCorrection) {
            controller.enqueue(encoder.encode(sseEvent("suggestion", final.suggestedCorrection)));
          } else if (rejected) {
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
