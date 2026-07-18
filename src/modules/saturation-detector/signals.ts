import type { RawAdRecord } from "@/core/ports/ad-source.port";

export interface SaturationSignals {
  advertiserCount: number;
  avgCampaignDurationDays: number;
  storeCount: number;
  adGrowthTrend: { period: string; count: number }[];
}

/**
 * Deterministic, testable extraction of saturation signals from the ads
 * actually returned by the ad source — never fabricated. `adGrowthTrend`
 * buckets ads by the ISO week their campaign started, giving a real (if
 * small-sample) view of how fast new advertisers piled onto this product.
 * A single search snapshot can't show a true trend over months; repeated
 * searches accumulate in `SearchHistory` and could feed a richer trend
 * in a future iteration.
 */
export function computeSaturationSignals(ads: RawAdRecord[]): SaturationSignals {
  const advertisers = new Set(ads.map((ad) => ad.pageName).filter(Boolean));
  const durations = ads
    .filter((ad) => ad.startDate)
    .map((ad) => daysBetween(ad.startDate!, ad.endDate));
  const avgCampaignDurationDays = durations.length
    ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
    : 0;

  const weekBuckets = new Map<string, number>();
  for (const ad of ads) {
    if (!ad.startDate) continue;
    const week = isoWeekLabel(new Date(ad.startDate));
    weekBuckets.set(week, (weekBuckets.get(week) ?? 0) + 1);
  }
  const adGrowthTrend = Array.from(weekBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, count]) => ({ period, count }));

  return {
    advertiserCount: advertisers.size,
    avgCampaignDurationDays,
    storeCount: advertisers.size,
    adGrowthTrend,
  };
}

function daysBetween(start: string, end?: string): number {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
}

function isoWeekLabel(date: Date): string {
  const target = new Date(date.getTime());
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}
