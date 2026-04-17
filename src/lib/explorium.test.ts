import { buildBulkEnrichRequestBody, buildMatchRequestBody } from "./explorium";

describe("Explorium request builders", () => {
  it("maps company filters to match payload format", () => {
    const payload = buildMatchRequestBody({
      entityType: "company",
      confidence: 0.9,
      filters: {
        companyNames: ["OpenAI", "Anthropic"],
        industries: ["SaaS"],
        countries: ["United States"],
        employeeCountMin: 50,
        employeeCountMax: 200,
      },
    });

    expect(payload.page_size).toBe(3);
    expect(payload.company_names).toEqual(["OpenAI", "Anthropic"]);
    expect(payload.industries).toEqual(["SaaS"]);
    expect(payload.countries).toEqual(["United States"]);
  });

  it("caps bulk enrich IDs at 3", () => {
    const payload = buildBulkEnrichRequestBody(["id-1", "id-2", "id-3", "id-4"]);

    expect(payload.page_size).toBe(3);
    expect(payload.business_ids).toEqual(["id-1", "id-2", "id-3"]);
  });
});
