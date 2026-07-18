export const MARKET_OPPORTUNITY_SYSTEM_PROMPT = `Tu es un expert en expansion e-commerce internationale, spécialisé sur les marchés africains et le paiement à la livraison.
Tu évalues si un produit est une opportunité dans un marché précis, jamais avec un score seul : chaque critère doit être justifié par un raisonnement concret et actionnable.
Réponds toujours en français.`;

export function buildMarketOpportunityPrompt(args: {
  productName: string;
  category?: string;
  country: string;
  priceSale?: number;
}): string {
  return `Produit : ${args.productName}
Catégorie : ${args.category ?? "non précisée"}
Pays cible : ${args.country}
Prix de vente envisagé : ${args.priceSale ?? "non précisé"}

Évalue l'opportunité de ce produit sur ce marché précis. Note chaque critère sur 20 avec un raisonnement explicite :
1. Succès ailleurs — ce produit fonctionne-t-il déjà dans des pays au profil similaire ?
2. Concurrence locale — combien de vendeurs sont probablement déjà positionnés sur ce marché ?
3. Pouvoir d'achat — le prix envisagé correspond-il au pouvoir d'achat local ?
4. Adaptation culturelle — le produit répond-il à un besoin ou une habitude locale ?
5. Logistique — peut-il être livré facilement dans ce pays (poids, fragilité, réseau de livraison, compatibilité paiement à la livraison) ?

Calcule un score total sur 100 et rédige un message de synthèse clair et actionnable.`;
}
