import { describe, expect, it } from "vitest";
import { computeSaturationSignals } from "./signals";
import type { RawAdRecord } from "@/core/ports/ad-source.port";

function ad(overrides: Partial<RawAdRecord>): RawAdRecord {
  return { pageName: "Boutique A", startDate: "2026-01-01", ...overrides };
}

describe("computeSaturationSignals", () => {
  it("counts distinct advertisers, not total ads", () => {
    const signals = computeSaturationSignals([
      ad({ pageName: "Boutique A" }),
      ad({ pageName: "Boutique A" }),
      ad({ pageName: "Boutique B" }),
    ]);
    expect(signals.advertiserCount).toBe(2);
    expect(signals.storeCount).toBe(2);
  });

  it("computes average campaign duration only from ads with a start date", () => {
    const signals = computeSaturationSignals([
      ad({ startDate: "2026-01-01", endDate: "2026-01-11" }), // 10 days
      ad({ startDate: "2026-01-01", endDate: "2026-01-21" }), // 20 days
      { pageName: "Boutique C" }, // no start date, ignored
    ]);
    expect(signals.avgCampaignDurationDays).toBe(15);
  });

  it("returns zero signals for an empty ad list", () => {
    const signals = computeSaturationSignals([]);
    expect(signals.advertiserCount).toBe(0);
    expect(signals.avgCampaignDurationDays).toBe(0);
    expect(signals.adGrowthTrend).toEqual([]);
  });

  it("buckets ads by ISO week for the growth trend", () => {
    const signals = computeSaturationSignals([
      ad({ startDate: "2026-01-05" }),
      ad({ startDate: "2026-01-06" }),
      ad({ startDate: "2026-02-02" }),
    ]);
    expect(signals.adGrowthTrend.length).toBeGreaterThan(0);
    const total = signals.adGrowthTrend.reduce((sum, t) => sum + t.count, 0);
    expect(total).toBe(3);
  });
});
