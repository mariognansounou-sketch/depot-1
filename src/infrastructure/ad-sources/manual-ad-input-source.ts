import type { AdSourcePort, RawAdRecord, AdSearchFilters } from "@/core/ports/ad-source.port";

/**
 * ManualAdInputSource — the always-available, always-legal fallback.
 *
 * When the Meta Ad Library API is not configured, or an ad simply isn't
 * reachable through it (already pruned from the archive, region-limited,
 * etc.), the user pastes the ad's public data themselves: what they can
 * see with their own eyes in Ads Manager or the public library page. No
 * automated access to Meta's systems happens here — this class simply
 * normalizes whatever the user typed into a RawAdRecord.
 */
export class ManualAdInputSource implements AdSourcePort {
  readonly name = "manual_input";

  async searchAds(_filters: AdSearchFilters): Promise<RawAdRecord[]> {
    // Manual input is single-record only — search is not applicable.
    return [];
  }

  async getAdByUrlOrId(_input: string): Promise<RawAdRecord | null> {
    // Resolution happens client-side (the user fills a form); this source
    // exists to satisfy the AdSourcePort contract and to document intent.
    return null;
  }

  normalize(input: Partial<RawAdRecord> & { sourceUrl?: string }): RawAdRecord {
    return {
      sourceArchiveId: input.sourceArchiveId,
      sourceUrl: input.sourceUrl,
      pageName: input.pageName,
      headline: input.headline,
      primaryText: input.primaryText,
      description: input.description,
      cta: input.cta,
      mediaType: input.mediaType ?? "UNKNOWN",
      mediaUrl: input.mediaUrl,
      countries: input.countries ?? [],
      languages: input.languages ?? [],
      startDate: input.startDate,
      endDate: input.endDate,
      isActive: input.isActive ?? true,
      variantsCount: input.variantsCount ?? 1,
      raw: { source: "manual" },
    };
  }
}
