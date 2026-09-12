import { streamObject } from "ai";

import { isLocallyRecognized } from "@/features/prompt-builder/data/concept-whitelist";
import { buildPracticePrompt } from "@/features/prompt-builder/lib/build-prompt";
import { getModel } from "@/lib/llm";
import { practiceGenerationSchema, type PracticeGenerationInput } from "@/lib/llm/types";

export const maxDuration = 60;

function sseEvent(event: string, data: string) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
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
      let sentInstructionLength = 0;

      try {
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

        if (rejected) {
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
      } catch (error) {
        const message = error instanceof Error ? error.message : "실습 생성에 실패했습니다.";
        controller.enqueue(encoder.encode(sseEvent("error", message)));
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
