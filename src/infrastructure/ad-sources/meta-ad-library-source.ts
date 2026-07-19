import type { AdSearchFilters, AdSourcePort, RawAdRecord } from "@/core/ports/ad-source.port";
import { ExternalProviderError } from "@/core/errors";
import { logger } from "@/infrastructure/logging/logger";

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || "v20.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

/**
 * MetaAdLibraryApiSource — talks to the OFFICIAL Meta Ad Library API
 * (`/ads_archive`), not to the public facebook.com/ads/library website.
 * This is the only ToS-compliant, programmatic way to pull ad data at
 * scale: https://www.facebook.com/ads/library/api
 *
 * Known limitations (documented for the user in-app, not hidden):
 *  - Requires a Meta App with Ad Library API access approved for your
 *    developer account and a valid `access_token`.
 *  - `ad_creative_bodies` / media fields are only guaranteed for ads that
 *    are still searchable in the archive (Meta prunes older commercial
 *    ads faster than political/issue ads).
 *  - Spend and impressions ranges are ONLY published for ads run about
 *    social issues, elections or politics — NOT for standard e-commerce
 *    ads. We never claim to expose spend data we don't have.
 *  - Rate limits apply per Meta's platform terms; callers should cache
 *    results (see SearchHistory) rather than re-querying identical filters.
 */
export class MetaAdLibraryApiSource implements AdSourcePort {
  readonly name = "meta_ad_library_api";

  constructor(private readonly accessToken: string = process.env.META_AD_LIBRARY_ACCESS_TOKEN ?? "") {}

  private assertConfigured() {
    if (!this.accessToken) {
      throw new ExternalProviderError(
        "meta_ad_library_api",
        "META_AD_LIBRARY_ACCESS_TOKEN is not configured. Use the manual ad input source instead, or configure API access — see docs/META_AD_LIBRARY.md.",
      );
    }
  }

  async searchAds(filters: AdSearchFilters): Promise<RawAdRecord[]> {
    this.assertConfigured();

    const params = new URLSearchParams({
      access_token: this.accessToken,
      search_terms: filters.query,
      ad_type: "ALL",
      ad_reached_countries: JSON.stringify(filters.countries?.length ? filters.countries : ["ALL"]),
      ad_active_status: filters.activeOnly ? "ACTIVE" : "ALL",
      limit: String(filters.limit ?? 25),
      fields: [
        "id",
        "ad_creative_bodies",
        "ad_creative_link_titles",
        "ad_creative_link_descriptions",
        "ad_creative_link_captions",
        "page_name",
        "ad_delivery_start_time",
        "ad_delivery_stop_time",
        "languages",
        "publisher_platforms",
        "ad_snapshot_url",
      ].join(","),
    });

    const response = await fetchGraphApi(`${GRAPH_BASE}/ads_archive?${params.toString()}`);

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      logger.error("Meta Ad Library API request failed", { status: response.status, body });
      throw new ExternalProviderError(
        "meta_ad_library_api",
        `Request failed with status ${response.status}`,
      );
    }

    const json = (await response.json()) as {
      data?: Array<Record<string, unknown>>;
    };

    return (json.data ?? []).map(mapGraphAdToRawRecord);
  }

  async getAdByUrlOrId(input: string): Promise<RawAdRecord | null> {
    this.assertConfigured();
    const archiveId = extractArchiveId(input);
    if (!archiveId) return null;

    const params = new URLSearchParams({
      access_token: this.accessToken,
      search_terms: "",
      ad_type: "ALL",
      ad_reached_countries: JSON.stringify(["ALL"]),
      fields: "id,ad_creative_bodies,page_name,ad_delivery_start_time,ad_delivery_stop_time,languages,ad_snapshot_url",
    });

    // The ads_archive endpoint does not support direct lookup-by-id search
    // terms; the documented approach is to fetch the node directly by id.
    const response = await fetchGraphApi(
      `${GRAPH_BASE}/${archiveId}?access_token=${encodeURIComponent(this.accessToken)}&fields=id,ad_creative_bodies,page_name,ad_delivery_start_time,ad_delivery_stop_time,languages,ad_snapshot_url`,
    );

    if (!response.ok) {
      return null;
    }
    const json = (await response.json()) as Record<string, unknown>;
    return mapGraphAdToRawRecord(json);
  }
}

/**
 * Wraps `fetch` so network-level failures (DNS errors, connection resets,
 * blocked egress) become a clean ExternalProviderError instead of an
 * unhandled rejection — the same failure class a real Meta outage would
 * produce, so this also protects production, not just this dev sandbox.
 */
async function fetchGraphApi(url: string): Promise<Response> {
  try {
    return await fetch(url, { method: "GET" });
  } catch (error) {
    logger.error("Meta Ad Library API network request failed", { error: String(error) });
    throw new ExternalProviderError(
      "meta_ad_library_api",
      "Impossible de contacter l'API Meta Ad Library (problème réseau ou service indisponible). Réessayez plus tard ou utilisez la saisie manuelle.",
    );
  }
}

function extractArchiveId(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d{10,}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    const id = url.searchParams.get("id");
    if (id) return id;
  } catch {
    // not a URL — fall through
  }
  return null;
}

function mapGraphAdToRawRecord(raw: Record<string, unknown>): RawAdRecord {
  const bodies = (raw.ad_creative_bodies as string[] | undefined) ?? [];
  const titles = (raw.ad_creative_link_titles as string[] | undefined) ?? [];
  const descriptions = (raw.ad_creative_link_descriptions as string[] | undefined) ?? [];
  const captions = (raw.ad_creative_link_captions as string[] | undefined) ?? [];

  return {
    sourceArchiveId: String(raw.id ?? ""),
    sourceUrl: (raw.ad_snapshot_url as string) ?? undefined,
    pageName: (raw.page_name as string) ?? undefined,
    headline: titles[0],
    primaryText: bodies[0],
    description: descriptions[0],
    cta: captions[0],
    mediaType: "UNKNOWN",
    countries: (raw.publisher_platforms as string[] | undefined) ?? [],
    languages: (raw.languages as string[] | undefined) ?? [],
    startDate: raw.ad_delivery_start_time as string | undefined,
    endDate: raw.ad_delivery_stop_time as string | undefined,
    isActive: !raw.ad_delivery_stop_time,
    variantsCount: bodies.length || 1,
    raw,
  };
}
