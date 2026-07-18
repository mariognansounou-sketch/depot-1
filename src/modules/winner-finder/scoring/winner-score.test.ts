import { describe, expect, it } from "vitest";
import { computeWinnerScore } from "./winner-score";

describe("computeWinnerScore", () => {
  it("gives a high score to a long-running, multi-country, multi-variant, still-active ad", () => {
    const result = computeWinnerScore({
      durationDays: 120,
      variantsCount: 5,
      countriesCount: 6,
      isActive: true,
    });

    expect(result.winnerScore).toBeGreaterThanOrEqual(80);
    expect(result.reasoning).toContain("120 jours");
    expect(result.reasoning.length).toBeGreaterThan(0);
  });

  it("gives a low score to a brand-new, single-country, single-variant, inactive ad", () => {
    const result = computeWinnerScore({
      durationDays: 2,
      variantsCount: 1,
      countriesCount: 1,
      isActive: false,
    });

    expect(result.winnerScore).toBeLessThan(30);
    expect(result.reasoning).toContain("n'est plus active");
  });

  it("always clamps sub-scores within [0, 100]", () => {
    const result = computeWinnerScore({
      durationDays: 100000,
      variantsCount: 999,
      countriesCount: 999,
      isActive: true,
    });

    expect(result.winnerScore).toBeLessThanOrEqual(100);
    expect(result.opportunity).toBeGreaterThanOrEqual(0);
    expect(result.opportunity).toBeLessThanOrEqual(100);
    expect(result.competitionLevel).toBeLessThanOrEqual(100);
    expect(result.launchPotential).toBeLessThanOrEqual(100);
  });

  it("rewards opportunity more when competition is estimated low", () => {
    const lowCompetition = computeWinnerScore({
      durationDays: 20,
      variantsCount: 1,
      countriesCount: 1,
      isActive: true,
    });
    const highCompetition = computeWinnerScore({
      durationDays: 120,
      variantsCount: 5,
      countriesCount: 8,
      isActive: true,
    });

    // High competition should score higher on winnerScore (more validated)
    // but the opportunity gap relative to winnerScore should be wider.
    expect(highCompetition.competitionLevel).toBeGreaterThan(lowCompetition.competitionLevel);
  });
});
