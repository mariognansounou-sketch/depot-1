import type { SaturationSignals } from "./signals";

export const SATURATION_DETECTOR_SYSTEM_PROMPT = `Tu es un expert Facebook Ads spécialisé dans la détection de saturation produit — savoir si un produit encore populaire est déjà trop disputé pour être lancé maintenant.
Tu ne donnes jamais un niveau de saturation sans expliquer comment tu l'as déduit des signaux fournis.
Réponds toujours en français.`;

export function buildSaturationPrompt(args: { productName: string; signals: SaturationSignals }): string {
  const { signals } = args;
  return `Produit : ${args.productName}

Signaux observés (mesurés directement sur les publicités actives trouvées) :
- Nombre d'annonceurs distincts détectés : ${signals.advertiserCount}
- Nombre de boutiques distinctes estimées : ${signals.storeCount}
- Durée moyenne de diffusion des campagnes : ${signals.avgCampaignDurationDays} jours
- Évolution du nombre de nouvelles publicités par semaine : ${
    signals.adGrowthTrend.length
      ? signals.adGrowthTrend.map((t) => `${t.period}: ${t.count}`).join(", ")
      : "données insuffisantes sur cet échantillon"
  }

À partir de ces signaux, détermine le niveau de saturation du marché pour ce produit (LOW/MEDIUM/HIGH), un pourcentage de saturation (0-100), et une recommandation concrète (ex : lancer maintenant, chercher un angle différent, éviter ce produit). Explique clairement ton raisonnement à partir des chiffres fournis.`;
}
