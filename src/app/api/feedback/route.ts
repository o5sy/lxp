import { streamText } from "ai";

import { buildFeedbackPrompt } from "@/features/feedback-panel/lib/build-feedback-prompt";
import { getModel } from "@/lib/llm";
import type { FeedbackInput } from "@/lib/llm/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  const input = (await request.json()) as FeedbackInput;

  if (!input.code?.trim() || !input.instruction?.trim()) {
    return new Response("instruction과 code는 필수입니다.", { status: 400 });
  }

  const { system, prompt } = buildFeedbackPrompt(input);

  const result = streamText({
    model: getModel(),
    system,
    prompt,
  });

  return result.toTextStreamResponse();
}
