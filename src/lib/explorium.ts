import { config } from "@/lib/config";
import type { ParsedPromptResult } from "@/lib/contracts";
import { AppError } from "@/lib/errors";
import { mockCompanyRecords, mockProspectRecords } from "@/lib/mock-data";

type ExploriumFilter = {
  field: string;
  values?: string[];
  min?: number;
  max?: number;
};

type ExploriumPayload = {
  page_size: number;
  filters: ExploriumFilter[];
};

type ExploriumSearchResponse = {
  results?: Array<Record<string, unknown>>;
  data?: Array<Record<string, unknown>>;
};

function asStringArray(values?: string[]): string[] | undefined {
  if (!values || values.length === 0) {
    return undefined;
  }

  const normalized = values.map((value) => value.trim()).filter((value) => value.length > 0);
  return normalized.length > 0 ? normalized : undefined;
}

export function buildExploriumPayload(parsed: ParsedPromptResult): ExploriumPayload {
  const filters: ExploriumFilter[] = [];

  const industries = asStringArray(parsed.filters.industries);
  if (industries) {
    filters.push({ field: "industry", values: industries });
  }

  const countries = asStringArray(parsed.filters.countries);
  if (countries) {
    filters.push({ field: "country", values: countries });
  }

  const keywords = asStringArray(parsed.filters.keywords);
  if (keywords) {
    filters.push({ field: "keywords", values: keywords });
  }

  const employeeCountMin = parsed.filters.employeeCountMin;
  const employeeCountMax = parsed.filters.employeeCountMax;
  if (employeeCountMin !== undefined || employeeCountMax !== undefined) {
    filters.push({
      field: "employee_count",
      min: employeeCountMin,
      max: employeeCountMax,
    });
  }

  const revenueMinUsd = parsed.filters.revenueMinUsd;
  const revenueMaxUsd = parsed.filters.revenueMaxUsd;
  if (revenueMinUsd !== undefined || revenueMaxUsd !== undefined) {
    filters.push({
      field: "revenue_usd",
      min: revenueMinUsd,
      max: revenueMaxUsd,
    });
  }

  const jobTitles = asStringArray(parsed.filters.jobTitles);
  if (jobTitles) {
    filters.push({ field: "job_title", values: jobTitles });
  }

  const departments = asStringArray(parsed.filters.departments);
  if (departments) {
    filters.push({ field: "department", values: departments });
  }

  return {
    page_size: 3,
    filters,
  };
}

function getEndpoint(entityType: ParsedPromptResult["entityType"]): string {
  return entityType === "prospect" ? "/v1/prospects/search" : "/v1/companies/search";
}

function getMockRecords(entityType: ParsedPromptResult["entityType"]): Array<Record<string, unknown>> {
  return entityType === "prospect" ? mockProspectRecords : mockCompanyRecords;
}

export async function searchExplorium(parsed: ParsedPromptResult): Promise<Array<Record<string, unknown>>> {
  if (!config.exploriumApiKey && !config.useMockExplorium) {
    throw new AppError("EXPLORIUM_API_ERROR", "Explorium API key is missing.");
  }

  if (config.useMockExplorium) {
    return getMockRecords(parsed.entityType);
  }
  const response = await fetch(`${config.exploriumBaseUrl}${getEndpoint(parsed.entityType)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.exploriumApiKey}`,
    },
    body: JSON.stringify(buildExploriumPayload(parsed)),
  });

  if (!response.ok) {
    throw new AppError(
      "EXPLORIUM_API_ERROR",
      `Explorium request failed with status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as ExploriumSearchResponse;
  const records = payload.results ?? payload.data ?? [];

  return Array.isArray(records) ? records : [];
}
