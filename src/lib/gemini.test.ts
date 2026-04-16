import { AppError } from "./errors";
import { __private__ } from "./gemini";

describe("parseGeminiOutput", () => {
  it("parses valid company payload", () => {
    const parsed = __private__.parseGeminiOutput(
      JSON.stringify({
        entity_type: "company",
        filters: {
          industries: ["SaaS"],
          countries: ["United States"],
          employee_count_min: 50,
          employee_count_max: 500,
        },
        confidence: 0.91,
      }),
    );

    expect(parsed.entityType).toBe("company");
    expect(parsed.filters.industries).toEqual(["SaaS"]);
    expect(parsed.filters.employeeCountMin).toBe(50);
    expect(parsed.confidence).toBe(0.91);
  });

  it("accepts fenced JSON output", () => {
    const parsed = __private__.parseGeminiOutput(
      "```json\n{\"entity_type\":\"prospect\",\"filters\":{\"job_titles\":[\"VP Sales\"]},\"confidence\":0.8}\n```",
    );

    expect(parsed.entityType).toBe("prospect");
    expect(parsed.filters.jobTitles).toEqual(["VP Sales"]);
  });

  it("throws on invalid JSON", () => {
    expect(() => __private__.parseGeminiOutput("not-json")).toThrow(AppError);
  });

  it("throws on invalid confidence", () => {
    expect(() =>
      __private__.parseGeminiOutput(
        JSON.stringify({
          entity_type: "company",
          filters: {},
          confidence: 2,
        }),
      ),
    ).toThrow(AppError);
  });
});
