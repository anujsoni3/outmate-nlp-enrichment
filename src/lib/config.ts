type AppConfig = {
  nodeEnv: "development" | "production" | "test";
  geminiApiKey: string;
  exploriumApiKey: string;
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

  const allowedOrigin = isProduction
    ? required("ALLOWED_ORIGIN", process.env.ALLOWED_ORIGIN)
    : process.env.ALLOWED_ORIGIN ?? "http://localhost:3000";

  return {
    nodeEnv,
    geminiApiKey,
    exploriumApiKey,
    allowedOrigin,
    useMockExplorium: parseBoolean(process.env.USE_MOCK_EXPLORIUM, true),
  };
}

export const config = getConfig();
