import { buildExploriumPayload } from "./explorium";

describe("buildExploriumPayload", () => {
  it("maps company filters to payload format", () => {
    const payload = buildExploriumPayload({
      entityType: "company",
      confidence: 0.9,
      filters: {
        industries: ["SaaS"],
        countries: ["United States"],
        employeeCountMin: 50,
        employeeCountMax: 200,
      },
    });

    expect(payload.page_size).toBe(3);
    expect(payload.filters.some((f) => f.field === "industry")).toBe(true);
    expect(payload.filters.some((f) => f.field === "employee_count")).toBe(true);
  });

  it("maps prospect titles and departments", () => {
    const payload = buildExploriumPayload({
      entityType: "prospect",
      confidence: 0.88,
      filters: {
        jobTitles: ["VP Sales"],
        departments: ["Sales"],
      },
    });

    expect(payload.filters.some((f) => f.field === "job_title")).toBe(true);
    expect(payload.filters.some((f) => f.field === "department")).toBe(true);
  });
});
