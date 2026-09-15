import { geminiFlashLiteModel, geminiModel } from "./google";

export function getModel() {
  return geminiModel;
}

export function getValidationModel() {
  return geminiFlashLiteModel;
}

export * from "./types";
