import { google } from "@ai-sdk/google";

export const geminiModel = google("gemini-3.6-flash");
// 개념 적합성 사전 판별처럼 가벼운 판단만 필요한 호출용 경량 모델.
export const geminiFlashLiteModel = google("gemini-flash-lite-latest");
