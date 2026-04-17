export type EntityType = "company" | "prospect";

export type EnrichmentFilters = {
  companyNames?: string[];
  industries?: string[];
  countries?: string[];
  keywords?: string[];
  employeeCountMin?: number;
  employeeCountMax?: number;
  revenueMinUsd?: number;
  revenueMaxUsd?: number;
  jobTitles?: string[];
  departments?: string[];
};

export type ParsedPromptResult = {
  entityType: EntityType;
  filters: EnrichmentFilters;
  confidence: number;
};

export type EnrichRequestBody = {
  prompt: string;
};

export type BaseResultRecord = {
  id: string;
  type: EntityType;
  name: string;
  country: string | null;
  linkedinUrl: string | null;
  raw?: Record<string, unknown>;
};

export type CompanyResultRecord = BaseResultRecord & {
  type: "company";
  domain: string | null;
  industry: string | null;
  revenue: string | null;
  employeeCount: number | null;
  website: string | null;
  location: string | null;
  foundedYear: number | null;
  techStack: string[];
  keyContacts: string[];
};

export type ProspectResultRecord = BaseResultRecord & {
  type: "prospect";
  title: string | null;
  company: string | null;
  email: string | null;
  location: string | null;
};

export type EnrichedRecord = CompanyResultRecord | ProspectResultRecord;

export type EnrichSuccessResponse = {
  results: EnrichedRecord[];
  meta: {
    entityType: EntityType;
    resultCount: number;
    requestId: string;
  };
};

export type ErrorCode =
  | "INVALID_PROMPT"
  | "RATE_LIMITED"
  | "GEMINI_PARSE_ERROR"
  | "GEMINI_API_ERROR"
  | "EXPLORIUM_API_ERROR"
  | "INTERNAL_ERROR";

export type EnrichErrorResponse = {
  message: string;
  errorCode: ErrorCode;
  requestId: string;
};

export const PROMPT_LENGTH_LIMITS = {
  min: 3,
  max: 1000,
} as const;
