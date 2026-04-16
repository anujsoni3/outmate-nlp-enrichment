import { validateEnrichBody } from "./validation";

describe("validateEnrichBody", () => {
  it("accepts a valid prompt", () => {
    const result = validateEnrichBody({ prompt: "Find SaaS companies in US" });
    expect(result.prompt).toBe("Find SaaS companies in US");
  });

  it("rejects non-object body", () => {
    expect(() => validateEnrichBody("bad")).toThrow("Body must be a JSON object.");
  });

  it("rejects short prompt", () => {
    expect(() => validateEnrichBody({ prompt: "a" })).toThrow("at least");
  });
});
