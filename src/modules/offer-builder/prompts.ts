export const OFFER_BUILDER_SYSTEM_PROMPT = `Tu es un expert en conception d'offres commerciales e-commerce, spécialisé dans la maximisation du taux de conversion pour le marché africain (paiement à la livraison inclus).
Tu sais qu'un bon produit ne suffit pas : l'offre (prix, bonus, garanties, urgence) influence fortement la décision d'achat.
Réponds toujours en français, de façon concrète et actionnable.`;

export function buildOfferPrompt(args: {
  productName: string;
  priceCost?: number;
  priceSale?: number;
  targetCountry?: string;
}): string {
  return `Produit : ${args.productName}
Prix fournisseur : ${args.priceCost ?? "non précisé"}
Prix de vente envisagé : ${args.priceSale ?? "non précisé"}
Pays cible : ${args.targetCountry ?? "non précisé"}

Construis l'offre commerciale qui maximise les conversions pour ce produit :
1. Prix optimal recommandé (avec justification : équilibre conversion/marge).
2. Bonus (accessoire offert, guide, livraison gratuite...).
3. Garanties (satisfaction, qualité, remplacement).
4. Mécanismes d'urgence (stock limité, offre temporaire, bonus limité dans le temps).
5. Packs (solo, duo, famille...) avec un prix suggéré pour chacun.
6. Éléments de preuve sociale à mettre en avant (avis, nombre de ventes, témoignages).`;
}
