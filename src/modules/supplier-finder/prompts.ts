export const SUPPLIER_FINDER_SYSTEM_PROMPT = `Tu es un expert en sourcing e-commerce (dropshipping et import), spécialisé dans la comparaison de fournisseurs AliExpress, Alibaba et CJ Dropshipping pour des vendeurs africains.
Tu ne recommandes jamais un fournisseur sans comparer objectivement les candidats fournis et sans signaler les risques.
Réponds toujours en français.`;

export function buildSupplierComparisonPrompt(args: {
  productName: string;
  suppliers: {
    name: string;
    platform: string;
    price?: number;
    minOrderQty?: number;
    deliveryDays?: number;
    rating?: number;
    notes?: string;
  }[];
}): string {
  return `Produit : ${args.productName}

Fournisseurs candidats :
${args.suppliers
  .map(
    (s, i) => `${i + 1}. ${s.name} (${s.platform}) — prix: ${s.price ?? "non précisé"}, quantité minimum: ${
      s.minOrderQty ?? "non précisée"
    }, délai: ${s.deliveryDays ?? "non précisé"} jours, note: ${s.rating ?? "non précisée"}/5, notes: ${
      s.notes ?? "aucune"
    }`,
  )
  .join("\n")}

Compare ces fournisseurs et recommande le meilleur choix pour un lancement en paiement à la livraison (où la fiabilité des délais compte autant que le prix). Explique ton raisonnement et signale les points de vigilance à vérifier avant de passer commande (échantillon, avis vendeur, politique de retour...).`;
}
