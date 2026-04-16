import { jsonResponse } from "@/lib/http";
import { createRequestId } from "@/lib/request-id";
import { validateEnrichBody } from "@/lib/validation";
import { parsePromptWithGemini } from "@/lib/gemini";
import { AppError, toErrorResponse } from "@/lib/errors";
import { searchExplorium } from "@/lib/explorium";
import { normalizeExploriumRecords } from "@/lib/normalize";
import { logger } from "@/lib/logger";
import { config } from "@/lib/config";

export async function POST(request: Request) {
  const requestId = createRequestId();

  try {
    const body = await request.json();
    const { prompt } = validateEnrichBody(body);

    const parsed = await parsePromptWithGemini(prompt);
    if (parsed.confidence < 0.5) {
      throw new AppError(
        "GEMINI_PARSE_ERROR",
        "Prompt is too ambiguous. Please add more detail to your search intent.",
      );
    }

    const rawRecords = await searchExplorium(parsed);
    const normalized = normalizeExploriumRecords(parsed.entityType, rawRecords);

    logger.info("Enrichment request completed", {
      requestId,
      promptLength: prompt.length,
      entityType: parsed.entityType,
      resultCount: normalized.length,
    });

    return jsonResponse({
      results: normalized,
      meta: {
        entityType: parsed.entityType,
        resultCount: normalized.length,
        requestId,
        parsedFilters: parsed.filters,
        confidence: parsed.confidence,
        dataSource: config.useMockExplorium ? "mock" : "live",
      },
    });
  } catch (error) {
    const handled =
      error instanceof SyntaxError
        ? {
            status: 400,
            body: {
              message: "Invalid JSON body.",
              errorCode: "INVALID_PROMPT",
              requestId,
            },
          }
        : error instanceof Error &&
            (error.message.includes("Prompt must") || error.message.includes("Body must"))
          ? {
              status: 400,
              body: {
                message: error.message,
                errorCode: "INVALID_PROMPT",
                requestId,
              },
            }
          : toErrorResponse(error, requestId);

    logger.error("Enrichment request failed", {
      requestId,
      status: handled.status,
      errorCode: handled.body.errorCode,
      message: handled.body.message,
    });

    return jsonResponse(handled.body, handled.status);
  }
}
