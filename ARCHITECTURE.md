# Architecture

## High-level flow

User Browser
-> Next.js Frontend (Prompt + Table + JSON Viewer)
-> POST /api/enrich
-> Gemini filter extraction
-> Explorium search/enrichment
-> Normalization + hard cap (3)
-> Frontend table rendering

## Backend pipeline

1. Validate request body and prompt length.
2. Parse prompt with Gemini into structured filters.
3. Select company/prospect endpoint for Explorium.
4. Request page_size = 3 and normalize records.
5. Enforce final safety cap with slice(0, 3).
6. Return stable response schema with meta and requestId.

## Security baseline

- API keys loaded only from environment variables.
- IP-based rate limiting at 10 requests per minute for /api/enrich.
- CORS restriction in production via ALLOWED_ORIGIN.
- Secrets are redacted in logs.

## Error model

- INVALID_PROMPT (400)
- RATE_LIMITED (429)
- GEMINI_PARSE_ERROR (422)
- GEMINI_API_ERROR (502)
- EXPLORIUM_API_ERROR (502)
- INTERNAL_ERROR (500)

## Deployment model

Single Next.js deployment on Vercel:
- Frontend and API routes share one runtime.
- No exposed server secrets in client code.
- Health endpoint available at /api/health.
