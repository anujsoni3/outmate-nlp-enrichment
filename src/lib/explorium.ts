import { config } from "@/lib/config";
import type { ParsedPromptResult } from "@/lib/contracts";
import { AppError } from "@/lib/errors";
import { mockCompanyRecords, mockProspectRecords } from "@/lib/mock-data";

type ExploriumApiResponse = {
  results?: Array<Record<string, unknown>>;
  data?: Array<Record<string, unknown>>;
  business_ids?: string[];
};

type MatchRequestBody = {
  company_names?: string[];
  keywords?: string[];
  countries?: string[];
  industries?: string[];
  page_size?: number;
};

type BulkEnrichRequestBody = {
  business_ids: string[];
  page_size: number;
};

function asStringArray(values?: string[]): string[] | undefined {
  if (!values || values.length === 0) {
    return undefined;
  }

  const normalized = values.map((value) => value.trim()).filter((value) => value.length > 0);
  return normalized.length > 0 ? normalized : undefined;
}

function getMockRecords(entityType: ParsedPromptResult["entityType"]): Array<Record<string, unknown>> {
  return entityType === "prospect" ? mockProspectRecords : mockCompanyRecords;
}

function getBulkEnrichPath(entityType: ParsedPromptResult["entityType"]): string {
  return entityType === "prospect"
    ? "/v1/businesses/people/bulk_enrich"
    : config.exploriumBulkEnrichPath;
}

export function buildMatchRequestBody(parsed: ParsedPromptResult): MatchRequestBody {
  return {
    company_names: asStringArray(parsed.filters.companyNames),
    keywords: asStringArray(parsed.filters.keywords),
    countries: asStringArray(parsed.filters.countries),
    industries: asStringArray(parsed.filters.industries),
    page_size: 3,
  };
}

async function matchBusinessIds(parsed: ParsedPromptResult): Promise<string[]> {
  const companyNames = asStringArray(parsed.filters.companyNames);
  if (!companyNames || companyNames.length === 0) {
    throw new AppError(
      "EXPLORIUM_API_ERROR",
      "Gemini must extract company names for Explorium matching.",
    );
  }

  const response = await fetch(`${config.exploriumBaseUrl}${config.exploriumMatchPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.exploriumApiKey}`,
    },
    body: JSON.stringify(buildMatchRequestBody(parsed)),
  });

  if (!response.ok) {
    throw new AppError(
      "EXPLORIUM_API_ERROR",
      `Explorium match request failed with status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as ExploriumApiResponse;
  const idsFromRoot = payload.business_ids ?? [];
  const idsFromResults = (payload.results ?? payload.data ?? [])
    .map((item) => String(item.business_id ?? item.id ?? ""))
    .filter((value) => value.length > 0);

  return [...new Set([...idsFromRoot, ...idsFromResults])].slice(0, 3);
}

export function buildBulkEnrichRequestBody(businessIds: string[]): BulkEnrichRequestBody {
  return {
    business_ids: businessIds.slice(0, 3),
    page_size: 3,
  };
}

async function bulkEnrichBusinessIds(
  entityType: ParsedPromptResult["entityType"],
  businessIds: string[],
): Promise<Array<Record<string, unknown>>> {
  const response = await fetch(`${config.exploriumBaseUrl}${getBulkEnrichPath(entityType)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.exploriumApiKey}`,
    },
    body: JSON.stringify(buildBulkEnrichRequestBody(businessIds)),
  });

  if (!response.ok) {
    throw new AppError(
      "EXPLORIUM_API_ERROR",
      `Explorium enrich request failed with status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as ExploriumApiResponse;
  const records = payload.results ?? payload.data ?? [];
  return Array.isArray(records) ? records.slice(0, 3) : [];
}

export async function searchExplorium(parsed: ParsedPromptResult): Promise<Array<Record<string, unknown>>> {
  if (!config.exploriumApiKey && !config.useMockExplorium) {
    throw new AppError("EXPLORIUM_API_ERROR", "Explorium API key is missing.");
  }

  if (config.useMockExplorium) {
    return getMockRecords(parsed.entityType);
  }

  const businessIds = await matchBusinessIds(parsed);
  if (businessIds.length === 0) {
    return [];
  }

  return bulkEnrichBusinessIds(parsed.entityType, businessIds);
}
