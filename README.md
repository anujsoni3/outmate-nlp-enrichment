# OutMate Enrichment Studio

A local-first Next.js app that turns a natural-language prompt into enriched B2B company or prospect data.

## What it does

The app:

1. Uses Gemini to interpret the prompt.
2. Resolves candidate company names through Explorium matching.
3. Enriches matched business IDs through Explorium bulk enrichment.
4. Shows the top results in a table with a raw JSON viewer.

If external APIs are unavailable, the app supports mock mode for local development.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Gemini API
- Explorium API
- Jest

## Local setup

1. Copy [.env.example](.env.example) to [.env](.env).
2. Fill in the values you want to use.
3. Install and start the app:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables

- `GEMINI_API_KEY`: Gemini API key.
- `EXPLORIUM_API_KEY`: Explorium API key.
- `EXPLORIUM_BASE_URL`: Explorium API base URL.
- `EXPLORIUM_MATCH_PATH`: match endpoint path.
- `EXPLORIUM_BULK_ENRICH_PATH`: bulk enrich endpoint path.
- `ALLOWED_ORIGIN`: frontend origin allowed in production.
- `USE_MOCK_EXPLORIUM`: set to `true` for local mock mode.
- `NODE_ENV`: normally `development` locally and `production` in deploys.

## API

### `POST /api/enrich`

Body:

```json
{
  "prompt": "Find 3 fast-growing SaaS companies in the US with 50-500 employees"
}
```

Response:

```json
{
  "results": [],
  "meta": {
    "entityType": "company",
    "resultCount": 0,
    "requestId": "...",
    "parsedFilters": {},
    "confidence": 0,
    "dataSource": "live"
  }
}
```

### `GET /api/health`

Returns:

```json
{ "status": "ok" }
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run check`

## Notes

- The app shows the parsed Gemini filters in the UI for debugging.
- The repo is meant for local use and can be configured for live APIs later.
