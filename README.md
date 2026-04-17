# OutMate - NLP Enrichment Demo

Mini production-style implementation of the Outmate NLP Database Enrichment assignment.

## Project overview

The app accepts a natural language prompt and performs this pipeline:

1. Parse prompt with Gemini into structured B2B filters and company names.
2. Match company names using Explorium `businesses_to_match`.
3. Call Explorium bulk enrich using the matched IDs.
4. Enforce a strict maximum of 3 records.
5. Render results in a clean table with per-row raw JSON inspection.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a system diagram and flow details.

## Tech stack

- Next.js (App Router) fullstack
- TypeScript
- Tailwind CSS v4
- Gemini via Generative Language API
- Explorium REST API
- Jest for test coverage

## Local run

1. Copy `.env.local.example` to `.env.local`.
2. Fill keys for live mode, or keep `USE_MOCK_EXPLORIUM=true` for local mock mode.
3. Run:

```bash
npm install
npm run dev
```

App URL: http://localhost:3000

Production template: `.env.production.example`

## Environment variables

- `GEMINI_API_KEY`: Gemini API key.
- `EXPLORIUM_API_KEY`: Explorium API key.
- `EXPLORIUM_BASE_URL`: Explorium API base URL.
- `EXPLORIUM_MATCH_PATH`: matching endpoint path used before bulk enrich.
- `EXPLORIUM_BULK_ENRICH_PATH`: bulk enrich endpoint path.
- `ALLOWED_ORIGIN`: frontend origin allowed by CORS in production.
- `USE_MOCK_EXPLORIUM`: `true` or `false`.

Important:
- Set `USE_MOCK_EXPLORIUM=false` for assignment submission and live Explorium validation.
- The API now fails explicitly when Gemini or Explorium calls fail (no implicit fallback in live mode).
- Explorium match request body uses `request_context: null` and `businesses_to_match: [{ name }]`.

## API contract

### POST /api/enrich

Request body:

```json
{
	"prompt": "Find 3 fast-growing SaaS companies in the US with 50-500 employees"
}
```

Success response:

```json
{
	"results": [
		{
			"id": "cmp-1001",
			"type": "company",
			"name": "Northstar AI Systems",
			"domain": "northstar.ai",
			"industry": "Artificial Intelligence",
			"employeeCount": 180,
			"revenue": "$55M",
			"country": "United States",
			"website": "https://northstar.ai",
			"linkedinUrl": "https://www.linkedin.com/company/northstar-ai",
			"raw": {}
		}
	],
	"meta": {
		"entityType": "company",
		"resultCount": 1,
		"requestId": "..."
	}
}
```

Error response:

```json
{
	"message": "Prompt must be at least 3 characters long.",
	"errorCode": "INVALID_PROMPT",
	"requestId": "..."
}
```

### GET /api/health

Response:

```json
{
	"status": "ok"
}
```

## Sample prompts

1. Find 3 fast-growing SaaS companies in the US with 50-500 employees, raising Series B or later.
2. Give me 3 VPs of Sales in European fintech startups with more than 100 employees.
3. Top AI infrastructure companies hiring machine learning engineers in India.
4. 3 marketing leaders at e-commerce brands in North America doing more than $50M in revenue.
5. Cybersecurity firms with increasing web traffic and at least 200 employees.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run check`
