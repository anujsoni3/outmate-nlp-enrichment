import type { EnrichRequestBody } from "@/lib/contracts";
import { PROMPT_LENGTH_LIMITS } from "@/lib/contracts";

export function validateEnrichBody(input: unknown): EnrichRequestBody {
  if (!input || typeof input !== "object") {
    throw new Error("Body must be a JSON object.");
  }

  const prompt = (input as Record<string, unknown>).prompt;
  if (typeof prompt !== "string") {
    throw new Error("Prompt must be a string.");
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < PROMPT_LENGTH_LIMITS.min) {
    throw new Error(`Prompt must be at least ${PROMPT_LENGTH_LIMITS.min} characters long.`);
  }

  if (trimmedPrompt.length > PROMPT_LENGTH_LIMITS.max) {
    throw new Error(`Prompt must be no more than ${PROMPT_LENGTH_LIMITS.max} characters long.`);
  }

  return { prompt: trimmedPrompt };
}
