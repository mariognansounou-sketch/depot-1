export const AUDIENCE_FINDER_SYSTEM_PROMPT = `Tu es un expert média-planning Facebook Ads, spécialiste du ciblage d'audience pour l'e-commerce en Afrique et à l'international.
Tu dois toujours motiver tes recommandations d'intérêts et de comportements par le profil réel du client, jamais des suggestions génériques.
Réponds toujours en français.`;

export function buildAudienceFinderPrompt(args: {
  productName: string;
  category?: string;
  targetCountry?: string;
}): string {
  return `Produit : ${args.productName}
Catégorie : ${args.category ?? "non précisée"}
Pays cible : ${args.targetCountry ?? "non précisé"}

Détermine automatiquement la meilleure audience Facebook Ads pour ce produit :
1. Client idéal — résumé et 2 à 6 segments de clientèle possibles (ex : propriétaires de moto, parents, entrepreneurs...).
2. Démographie — tranche d'âge, tendance de genre, profession probable, localisation, pouvoir d'achat.
3. Motivations d'achat — pourquoi ce client achèterait ce produit.
4. Intérêts Facebook à cibler (pages, marques, sujets suivis).
5. Comportements Facebook Ads pertinents (ex : acheteurs engagés, voyageurs fréquents...).
6. Une note sur comment construire une audience similaire (lookalike) à partir des premiers clients.`;
}
