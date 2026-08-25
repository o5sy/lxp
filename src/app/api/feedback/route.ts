import { streamObject } from "ai";

import { buildFeedbackPrompt } from "@/features/feedback-panel/lib/build-feedback-prompt";
import { getModel } from "@/lib/llm";
import { feedbackSchema, type FeedbackInput } from "@/lib/llm/types";

export const maxDuration = 60;

function sseEvent(event: string, data: string) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  const input = (await request.json()) as FeedbackInput;

  if (!input.code?.trim() || !input.instruction?.trim()) {
    return new Response("instruction과 code는 필수입니다.", { status: 400 });
  }

  const { system, prompt } = buildFeedbackPrompt(input);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      let sentFeedbackLength = 0;

      try {
        const result = streamObject({
          model: getModel(),
          schema: feedbackSchema,
          system,
          prompt,
        });

        for await (const partial of result.partialObjectStream) {
          const feedback = partial.feedback ?? "";
          if (feedback.length > sentFeedbackLength) {
            const delta = feedback.slice(sentFeedbackLength);
            sentFeedbackLength = feedback.length;
            controller.enqueue(encoder.encode(sseEvent("feedback-delta", delta)));
          }
        }

        const final = await result.object;
        if (final.feedback.length > sentFeedbackLength) {
          controller.enqueue(encoder.encode(sseEvent("feedback-delta", final.feedback.slice(sentFeedbackLength))));
        }
        controller.enqueue(
          encoder.encode(sseEvent("verdict", JSON.stringify({ criteriaChecks: final.criteriaChecks }))),
        );
        controller.enqueue(encoder.encode(sseEvent("done", "")));
      } catch (error) {
        const message = error instanceof Error ? error.message : "피드백 요청에 실패했습니다.";
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
