import { describe, expect, it } from "vitest";
import { ManualAdInputSource } from "./manual-ad-input-source";

describe("ManualAdInputSource.normalize", () => {
  it("fills sensible defaults for missing optional fields", () => {
    const source = new ManualAdInputSource();
    const record = source.normalize({ headline: "GPS Tracker Pro" });

    expect(record.headline).toBe("GPS Tracker Pro");
    expect(record.mediaType).toBe("UNKNOWN");
    expect(record.countries).toEqual([]);
    expect(record.languages).toEqual([]);
    expect(record.isActive).toBe(true);
    expect(record.variantsCount).toBe(1);
  });

  it("preserves explicitly provided values", () => {
    const source = new ManualAdInputSource();
    const record = source.normalize({
      headline: "GPS Tracker Pro",
      countries: ["BJ", "CI"],
      variantsCount: 4,
      isActive: false,
    });

    expect(record.countries).toEqual(["BJ", "CI"]);
    expect(record.variantsCount).toBe(4);
    expect(record.isActive).toBe(false);
  });
});
