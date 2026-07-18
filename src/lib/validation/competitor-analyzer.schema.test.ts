import { describe, expect, it } from "vitest";
import { competitorAnalysisRequestSchema } from "./competitor-analyzer.schema";

describe("competitorAnalysisRequestSchema", () => {
  it("accepts a manual ad submission with no `value` (regression: manual mode used to require a redundant field)", () => {
    const result = competitorAnalysisRequestSchema.safeParse({
      mode: "PRODUCT_NAME",
      manualAd: { headline: "Ne perdez plus jamais votre moto", pageName: "MotoSecure" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a submission with neither `value` nor `manualAd`", () => {
    const result = competitorAnalysisRequestSchema.safeParse({ mode: "PRODUCT_NAME" });
    expect(result.success).toBe(false);
  });

  it("still requires a non-empty `value` when no manual ad is provided", () => {
    const result = competitorAnalysisRequestSchema.safeParse({ mode: "AD_URL", value: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a normal value-based search with no manual ad", () => {
    const result = competitorAnalysisRequestSchema.safeParse({
      mode: "PRODUCT_NAME",
      value: "GPS tracker moto",
    });
    expect(result.success).toBe(true);
  });
});
