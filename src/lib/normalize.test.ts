import { normalizeExploriumRecords } from "./normalize";

describe("normalizeExploriumRecords", () => {
  it("enforces max 3 records", () => {
    const records = new Array(5).fill(null).map((_, index) => ({
      id: `cmp-${index}`,
      name: `Company ${index}`,
      industry: "SaaS",
    }));

    const normalized = normalizeExploriumRecords("company", records);
    expect(normalized).toHaveLength(3);
  });

  it("normalizes company fields", () => {
    const normalized = normalizeExploriumRecords("company", [
      {
        id: "cmp-1",
        name: "Northstar",
        domain: "northstar.ai",
        annual_revenue: "$50M",
        employee_count: 200,
      },
    ]);

    expect(normalized[0]).toMatchObject({
      type: "company",
      name: "Northstar",
      domain: "northstar.ai",
    });
  });

  it("normalizes prospect fields", () => {
    const normalized = normalizeExploriumRecords("prospect", [
      {
        id: "prs-1",
        first_name: "Avery",
        last_name: "Sharma",
        title: "VP Sales",
      },
    ]);

    expect(normalized[0]).toMatchObject({
      type: "prospect",
      name: "Avery Sharma",
      title: "VP Sales",
    });
  });
});
