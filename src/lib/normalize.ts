import type {
  CompanyResultRecord,
  EntityType,
  EnrichedRecord,
  ProspectResultRecord,
} from "@/lib/contracts";

function firstString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

function firstNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function arrayOfStrings(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function normalizeCompany(record: Record<string, unknown>): CompanyResultRecord {
  return {
    id: firstString(record, ["id", "company_id"]) ?? "unknown-company",
    type: "company",
    name: firstString(record, ["name", "company_name"]) ?? "Unknown Company",
    domain: firstString(record, ["domain", "website_domain"]),
    industry: firstString(record, ["industry"]),
    revenue: firstString(record, ["annual_revenue", "revenue"]),
    employeeCount: firstNumber(record, ["employee_count", "employees"]),
    country: firstString(record, ["country", "hq_country"]),
    website: firstString(record, ["website", "website_url"]),
    linkedinUrl: firstString(record, ["linkedin_url", "linkedin"]),
    location: firstString(record, ["location", "city"]),
    foundedYear: firstNumber(record, ["founded_year"]),
    techStack: arrayOfStrings(record, "tech_stack"),
    keyContacts: arrayOfStrings(record, "key_contacts"),
    raw: record,
  };
}

function normalizeProspect(record: Record<string, unknown>): ProspectResultRecord {
  const fullName = firstString(record, ["full_name"]);
  const firstName = firstString(record, ["first_name"]);
  const lastName = firstString(record, ["last_name"]);

  return {
    id: firstString(record, ["id", "prospect_id"]) ?? "unknown-prospect",
    type: "prospect",
    name: fullName ?? `${firstName ?? "Unknown"} ${lastName ?? "Person"}`,
    title: firstString(record, ["title", "job_title"]),
    company: firstString(record, ["company", "company_name"]),
    email: firstString(record, ["email", "work_email"]),
    country: firstString(record, ["country"]),
    linkedinUrl: firstString(record, ["linkedin_url", "linkedin"]),
    location: firstString(record, ["location", "city"]),
    raw: record,
  };
}

export function normalizeExploriumRecords(
  entityType: EntityType,
  records: Array<Record<string, unknown>>,
): EnrichedRecord[] {
  const capped = records.slice(0, 3);

  return capped.map((record) =>
    entityType === "prospect" ? normalizeProspect(record) : normalizeCompany(record),
  );
}
