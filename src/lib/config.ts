type AppConfig = {
  nodeEnv: "development" | "production" | "test";
  geminiApiKey: string;
  exploriumApiKey: string;
  exploriumBaseUrl: string;
  exploriumMatchPath: string;
  exploriumBulkEnrichPath: string;
  allowedOrigin: string;
  useMockExplorium: boolean;
};

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const normalized = value.toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getConfig(): AppConfig {
  const nodeEnv = (process.env.NODE_ENV ?? "development") as AppConfig["nodeEnv"];
  const isProduction = nodeEnv === "production";

  const geminiApiKey = isProduction
    ? required("GEMINI_API_KEY", process.env.GEMINI_API_KEY)
    : process.env.GEMINI_API_KEY ?? "";

  const exploriumApiKey = isProduction
    ? required("EXPLORIUM_API_KEY", process.env.EXPLORIUM_API_KEY)
    : process.env.EXPLORIUM_API_KEY ?? "";

  const exploriumBaseUrl = process.env.EXPLORIUM_BASE_URL ?? "https://api.explorium.ai";
  const exploriumMatchPath = process.env.EXPLORIUM_MATCH_PATH ?? "/v1/businesses/match";
  const exploriumBulkEnrichPath =
    process.env.EXPLORIUM_BULK_ENRICH_PATH ?? "/v1/businesses/firmographics/bulk_enrich";

  const allowedOrigin = isProduction
    ? required("ALLOWED_ORIGIN", process.env.ALLOWED_ORIGIN)
    : process.env.ALLOWED_ORIGIN ?? "http://localhost:3000";

  return {
    nodeEnv,
    geminiApiKey,
    exploriumApiKey,
    exploriumBaseUrl,
    exploriumMatchPath,
    exploriumBulkEnrichPath,
    allowedOrigin,
    useMockExplorium: parseBoolean(process.env.USE_MOCK_EXPLORIUM, true),
  };
}

export const config = getConfig();
