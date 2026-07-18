import type { AdSourcePort } from "@/core/ports/ad-source.port";
import { MetaAdLibraryApiSource } from "./meta-ad-library-source";
import { ManualAdInputSource } from "./manual-ad-input-source";

/**
 * Returns the best available AdSourcePort: the official Meta Ad Library
 * API when a token is configured, otherwise the manual-input fallback.
 * Callers (use-cases) never need to know which one is active.
 */
export function getAdSource(): AdSourcePort {
  if (process.env.META_AD_LIBRARY_ACCESS_TOKEN) {
    return new MetaAdLibraryApiSource();
  }
  return new ManualAdInputSource();
}

export function isMetaAdLibraryConfigured(): boolean {
  return Boolean(process.env.META_AD_LIBRARY_ACCESS_TOKEN);
}
