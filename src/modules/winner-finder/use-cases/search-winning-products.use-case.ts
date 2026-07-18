import type { AdSourcePort, RawAdRecord } from "@/core/ports/ad-source.port";
import { prisma } from "@/infrastructure/db/prisma";
import { computeWinnerScore } from "../scoring/winner-score";
import type { WinnerCandidate, WinnerFinderFilters } from "../types";

function daysBetween(start?: string, end?: string): number {
  if (!start) return 0;
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function toCandidate(record: RawAdRecord): WinnerCandidate {
  const durationDays = daysBetween(record.startDate, record.endDate);
  const scores = computeWinnerScore({
    durationDays,
    variantsCount: record.variantsCount ?? 1,
    countriesCount: record.countries?.length ?? 1,
    isActive: record.isActive ?? true,
  });

  return {
    productName: record.headline || record.pageName || "Produit sans titre",
    pageName: record.pageName,
    sourceUrl: record.sourceUrl,
    countries: record.countries ?? [],
    variantsCount: record.variantsCount ?? 1,
    durationDays,
    isActive: record.isActive ?? true,
    mediaType: record.mediaType,
    scores: {
      winnerScore: scores.winnerScore,
      opportunity: scores.opportunity,
      competitionLevel: scores.competitionLevel,
      launchPotential: scores.launchPotential,
    },
    reasoning: scores.reasoning,
  };
}

export class SearchWinningProductsUseCase {
  constructor(private readonly adSource: AdSourcePort) {}

  async execute(userId: string, filters: WinnerFinderFilters): Promise<WinnerCandidate[]> {
    const records = await this.adSource.searchAds({
      query: filters.query,
      countries: filters.countries,
      category: filters.category,
      activeOnly: false,
      minDurationDays: filters.minDurationDays,
      language: filters.language,
      limit: 30,
    });

    const candidates = records
      .map(toCandidate)
      .filter((candidate) =>
        filters.minDurationDays ? candidate.durationDays >= filters.minDurationDays : true,
      )
      .sort((a, b) => b.scores.winnerScore - a.scores.winnerScore);

    await prisma.searchHistory.create({
      data: {
        userId,
        module: "winner-finder",
        query: filters as unknown as object,
        resultSummary: `${candidates.length} produit(s) trouvé(s) pour "${filters.query}"`,
      },
    });

    return candidates;
  }
}
