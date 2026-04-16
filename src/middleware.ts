import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type RateLimitState = {
  count: number;
  windowStart: number;
};

const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const rateMap = new Map<string, RateLimitState>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function applyCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  const nodeEnv = process.env.NODE_ENV ?? "development";

  const selectedOrigin =
    nodeEnv === "production"
      ? allowedOrigin && origin === allowedOrigin
        ? origin
        : null
      : origin ?? "*";

  if (selectedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", selectedOrigin);
  }

  response.headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return response;
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const state = rateMap.get(ip);

  if (!state || now - state.windowStart >= WINDOW_MS) {
    rateMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  state.count += 1;
  rateMap.set(ip, state);

  return state.count > RATE_LIMIT;
}

export function middleware(request: NextRequest): NextResponse {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return applyCorsHeaders(new NextResponse(null, { status: 204 }), origin);
  }

  if (request.nextUrl.pathname === "/api/enrich" && request.method === "POST") {
    const ip = getClientIp(request);

    if (isRateLimited(ip)) {
      const limitedResponse = NextResponse.json(
        {
          message: "Rate limit exceeded. Try again in one minute.",
          errorCode: "RATE_LIMITED",
          requestId: crypto.randomUUID(),
        },
        { status: 429 },
      );

      return applyCorsHeaders(limitedResponse, origin);
    }
  }

  return applyCorsHeaders(NextResponse.next(), origin);
}

export const config = {
  matcher: ["/api/:path*"],
};
