# Outmate NLP Enrichment

Mini fullstack Next.js implementation of Outmate.ai's NLP Database Enrichment assignment.

## Local setup

1. Copy `.env.local.example` to `.env.local`.
2. Fill in required keys for live mode.
3. Start the dev server:

```bash
npm install
npm run dev
```

## Environment variables

- `GEMINI_API_KEY`: Gemini API key.
- `EXPLORIUM_API_KEY`: Explorium API key.
- `ALLOWED_ORIGIN`: production frontend origin for CORS policy.
- `USE_MOCK_EXPLORIUM`: `true`/`false` toggle for local mocked enrichment.

## Scripts

- `npm run dev`: start local dev server.
- `npm run build`: production build.
- `npm run start`: run built app.
- `npm run lint`: lint checks.
- `npm run typecheck`: strict TypeScript checks.
