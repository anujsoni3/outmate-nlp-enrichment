import type { ErrorCode, EnrichErrorResponse } from "@/lib/contracts";

export const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  INVALID_PROMPT: 400,
  RATE_LIMITED: 429,
  GEMINI_PARSE_ERROR: 422,
  GEMINI_API_ERROR: 502,
  EXPLORIUM_API_ERROR: 502,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly status: number;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
    this.status = ERROR_STATUS_MAP[code];
  }
}

export function toErrorResponse(error: unknown, requestId: string): {
  status: number;
  body: EnrichErrorResponse;
} {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        message: error.message,
        errorCode: error.code,
        requestId,
      },
    };
  }

  return {
    status: ERROR_STATUS_MAP.INTERNAL_ERROR,
    body: {
      message: "Something went wrong while processing your request.",
      errorCode: "INTERNAL_ERROR",
      requestId,
    },
  };
}
