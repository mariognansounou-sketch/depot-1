import { prisma } from "@/infrastructure/db/prisma";

export interface BrainStats {
  totalProducts: number;
  productsByStatus: Record<string, number>;
  totalValidations: number;
  avgValidationScore: number | null;
  decisionsBreakdown: Record<string, number>;
  totalCreativeAnalyses: number;
  avgHookScore: number | null;
  totalSaturationReports: number;
  totalScripts: number;
  totalCopyAssets: number;
  topModules: string[];
}

/**
 * Pulls real, already-persisted activity for this user — never fabricated.
 * This is the deterministic core the AI narrative in prompts.ts is
 * required to reason from, not invent numbers on top of.
 */
export async function computeBrainStats(userId: string): Promise<BrainStats> {
  const [
    totalProducts,
    productsByStatusRaw,
    validations,
    decisionsRaw,
    creativeAnalyses,
    totalSaturationReports,
    totalScripts,
    totalCopyAssets,
    recentSearches,
  ] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.product.groupBy({ by: ["status"], where: { userId }, _count: true }),
    prisma.productValidation.findMany({
      where: { product: { userId } },
      select: { totalScore: true },
    }),
    prisma.productValidation.groupBy({
      by: ["decision"],
      where: { product: { userId } },
      _count: true,
    }),
    prisma.creativeAnalysis.findMany({ where: { userId }, select: { hookAttentionScore: true } }),
    prisma.saturationReport.count({ where: { product: { userId } } }),
    prisma.scriptAsset.count({ where: { userId } }),
    prisma.copyAsset.count({ where: { userId } }),
    prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { module: true },
    }),
  ]);

  const productsByStatus: Record<string, number> = {};
  for (const row of productsByStatusRaw) {
    productsByStatus[row.status] = row._count;
  }

  const decisionsBreakdown: Record<string, number> = {};
  for (const row of decisionsRaw) {
    decisionsBreakdown[row.decision] = row._count;
  }

  const moduleFrequency = new Map<string, number>();
  for (const search of recentSearches) {
    moduleFrequency.set(search.module, (moduleFrequency.get(search.module) ?? 0) + 1);
  }
  const topModules = Array.from(moduleFrequency.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([module]) => module);

  return {
    totalProducts,
    productsByStatus,
    totalValidations: validations.length,
    avgValidationScore: average(validations.map((v) => v.totalScore)),
    decisionsBreakdown,
    totalCreativeAnalyses: creativeAnalyses.length,
    avgHookScore: average(creativeAnalyses.map((c) => c.hookAttentionScore)),
    totalSaturationReports,
    totalScripts,
    totalCopyAssets,
    topModules,
  };
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10;
}
