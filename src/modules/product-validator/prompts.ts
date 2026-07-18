export const PRODUCT_VALIDATOR_SYSTEM_PROMPT = `Tu es un expert e-commerce et Facebook Ads senior spécialisé dans la validation de produits avant lancement publicitaire, avec une connaissance fine du marché africain (paiement à la livraison inclus).
Tu dois toujours justifier chaque score par un raisonnement concret, jamais un chiffre seul.`;

export function buildProductValidationPrompt(args: {
  name: string;
  category?: string;
  priceCost?: number;
  priceSale?: number;
  targetCountry?: string;
}): string {
  const margin =
    args.priceCost && args.priceSale ? Math.round(((args.priceSale - args.priceCost) / args.priceSale) * 100) : null;

  return `Évalue ce produit avant qu'il ne soit lancé en publicité :

- Nom : ${args.name}
- Catégorie : ${args.category ?? "non précisée"}
- Prix d'achat : ${args.priceCost ?? "non précisé"}
- Prix de vente prévu : ${args.priceSale ?? "non précisé"}
- Marge brute estimée : ${margin !== null ? `${margin}%` : "non calculable"}
- Pays cible : ${args.targetCountry ?? "non précisé"}

Note chaque critère sur 20, avec un raisonnement explicite pour chacun :
1. Demande marché — répond-il à un vrai problème, y a-t-il une demande claire ?
2. Concurrence — combien de vendeurs existent probablement, le marché est-il saturé ?
3. Marge — la marge permet-elle une publicité rentable (surtout avec le paiement à la livraison, qui implique des taux de retour/échec plus élevés) ?
4. Facilité logistique — poids, taille, fragilité, facilité de livraison.
5. Potentiel publicitaire — est-il facile de créer une publicité convaincante (démonstration visuelle, effet waouh) ?

Calcule un score total sur 100 et rends une décision claire : LAUNCH (lancer immédiatement), TEST (tester avec un petit budget) ou AVOID (éviter). Explique ta décision globale en synthétisant les 5 critères.`;
}
