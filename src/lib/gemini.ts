import { AppError } from "@/lib/errors";
import type { EnrichmentFilters, ParsedPromptResult } from "@/lib/contracts";
import { config } from "@/lib/config";

const GEMINI_MODEL = "gemini-2.0-flash";

const SYSTEM_PROMPT = [
  "You convert sales and marketing prompts to structured B2B filters.",
  "Return JSON only with this exact shape:",
  '{"entity_type":"company|prospect","filters":{"industries":string[],"countries":string[],"keywords":string[],"employee_count_min":number,"employee_count_max":number,"revenue_min_usd":number,"revenue_max_usd":number,"job_titles":string[],"departments":string[]},"confidence":number}',
  "Rules:",
  "1) Output JSON only. No markdown.",
  "2) Infer entity_type from prompt intent: person/contact/title -> prospect, otherwise company.",
  "3) Include only fields inferred from prompt. Omit empty filters.",
  "4) confidence must be between 0 and 1.",
  "5) Normalize countries to full names when clear.",
  "6) For ambiguous prompts, still return best effort filters with lower confidence.",
].join("\n");

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type GeminiParsedShape = {
  entity_type?: string;
  filters?: {
    industries?: unknown;
    countries?: unknown;
    keywords?: unknown;
    employee_count_min?: unknown;
    employee_count_max?: unknown;
    revenue_min_usd?: unknown;
    revenue_max_usd?: unknown;
    job_titles?: unknown;
    departments?: unknown;
  };
  confidence?: unknown;
};

function parseStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const parsed = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);

  return parsed.length > 0 ? parsed : undefined;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }

  return undefined;
}

function parseFilters(input?: GeminiParsedShape["filters"]): EnrichmentFilters {
  return {
    industries: parseStringArray(input?.industries),
    countries: parseStringArray(input?.countries),
    keywords: parseStringArray(input?.keywords),
    employeeCountMin: parseNumber(input?.employee_count_min),
    employeeCountMax: parseNumber(input?.employee_count_max),
    revenueMinUsd: parseNumber(input?.revenue_min_usd),
    revenueMaxUsd: parseNumber(input?.revenue_max_usd),
    jobTitles: parseStringArray(input?.job_titles),
    departments: parseStringArray(input?.departments),
  };
}

function parseEntityType(raw: unknown): "company" | "prospect" {
  return raw === "prospect" ? "prospect" : "company";
}

function extractJson(text: string): string {
  const trimmed = text.trim();

  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    const noFence = trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    return noFence;
  }

  return trimmed;
}

function parseGeminiOutput(rawText: string): ParsedPromptResult {
  let parsed: GeminiParsedShape;
  try {
    parsed = JSON.parse(extractJson(rawText)) as GeminiParsedShape;
  } catch {
    throw new AppError("GEMINI_PARSE_ERROR", "Gemini returned invalid JSON output.");
  }

  const confidence = parseNumber(parsed.confidence);
  if (confidence === undefined || confidence < 0 || confidence > 1) {
    throw new AppError("GEMINI_PARSE_ERROR", "Gemini returned an invalid confidence value.");
  }

  return {
    entityType: parseEntityType(parsed.entity_type),
    filters: parseFilters(parsed.filters),
    confidence,
  };
}

async function callGemini(prompt: string): Promise<string> {
  if (!config.geminiApiKey) {
    throw new AppError("GEMINI_API_ERROR", "Gemini API key is missing.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${config.geminiApiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw new AppError("GEMINI_API_ERROR", `Gemini request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new AppError("GEMINI_PARSE_ERROR", "Gemini response did not include content text.");
  }

  return text;
}

export async function parsePromptWithGemini(prompt: string): Promise<ParsedPromptResult> {
  const raw = await callGemini(prompt);
  return parseGeminiOutput(raw);
}

export const __private__ = {
  parseGeminiOutput,
};
