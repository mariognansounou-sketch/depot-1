/**
 * AdSourcePort — the contract every ad data source must implement.
 *
 * IMPORTANT (legal & ToS compliance):
 * We deliberately do NOT scrape the Meta Ad Library website. Meta's Terms
 * of Service prohibit automated scraping of facebook.com/ads/library, and
 * doing so would also be technically unreliable (anti-bot protections).
 *
 * Instead this app supports two compliant ways to bring ad data in:
 *   1. `MetaAdLibraryApiSource` — the OFFICIAL Meta Ad Library API
 *      (Graph API `/ads_archive` endpoint), which Meta explicitly publishes
 *      for this exact use case. It requires a Meta App + an approved
 *      access token. Coverage/fields differ by ad category — see
 *      docs/META_AD_LIBRARY.md for the exact limitations (e.g. spend and
 *      impressions ranges are only available for political/issue ads).
 *   2. `ManualAdInputSource` — the user pastes the ad's public data
 *      (headline, text, media URL, CTA, dates...) themselves, e.g. copied
 *      from an ad they viewed in their own Ads Manager or the public
 *      library page. Always legal, always available, and the required
 *      fallback whenever the API doesn't return a given ad.
 */

export interface RawAdRecord {
  sourceArchiveId?: string;
  sourceUrl?: string;
  pageName?: string;
  headline?: string;
  primaryText?: string;
  description?: string;
  cta?: string;
  mediaType?: "VIDEO" | "IMAGE" | "CAROUSEL" | "UNKNOWN";
  mediaUrl?: string;
  countries?: string[];
  languages?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  variantsCount?: number;
  raw?: Record<string, unknown>;
}

export interface AdSearchFilters {
  query: string;
  countries?: string[];
  category?: string;
  activeOnly?: boolean;
  minDurationDays?: number;
  language?: string;
  limit?: number;
}

export interface AdSourcePort {
  readonly name: string;

  /** Search ads by free-text query (brand, product, page name). */
  searchAds(filters: AdSearchFilters): Promise<RawAdRecord[]>;

  /** Resolve a single ad from a Meta Ad Library URL or archive ID. */
  getAdByUrlOrId(input: string): Promise<RawAdRecord | null>;
}
