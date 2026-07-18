export const COPYWRITER_SYSTEM_PROMPT = `Tu es un copywriter e-commerce senior, expert en conversion pour le marché africain (paiement à la livraison inclus).
Tes textes sont concis, persuasifs et jamais génériques : chaque phrase doit pousser à l'action.
Réponds toujours en français.`;

function productContext(args: {
  productName: string;
  category?: string;
  priceSale?: number;
  targetCountry?: string;
}): string {
  return `Produit : ${args.productName}
Catégorie : ${args.category ?? "non précisée"}
Prix de vente : ${args.priceSale ?? "non précisé"}
Pays cible : ${args.targetCountry ?? "non précisé"}`;
}

export function buildFacebookAdsCopyPrompt(args: {
  productName: string;
  category?: string;
  priceSale?: number;
  targetCountry?: string;
}): string {
  return `${productContext(args)}

Rédige un texte publicitaire Facebook Ads complet et optimisé pour la conversion, le paiement à la livraison et le marché africain : titre (headline), texte principal (primary text), description, et CTA.`;
}

export function buildWhatsAppCopyPrompt(args: {
  productName: string;
  category?: string;
  priceSale?: number;
  targetCountry?: string;
}): string {
  return `${productContext(args)}

Rédige les messages WhatsApp Business pour vendre ce produit : message d'accueil, réponses automatiques aux questions fréquentes, messages de relance pour un prospect qui ne répond plus, et messages de fermeture de vente.`;
}

export function buildShopifyCopyPrompt(args: {
  productName: string;
  category?: string;
  priceSale?: number;
  targetCountry?: string;
}): string {
  return `${productContext(args)}

Rédige une fiche produit Shopify complète : titre produit optimisé SEO, description persuasive, liste de bénéfices (pas de simples caractéristiques), FAQ (au moins 3 questions), objections courantes avec leur réponse, et garanties à afficher.`;
}

export function buildTikTokCopyPrompt(args: {
  productName: string;
  category?: string;
  priceSale?: number;
  targetCountry?: string;
}): string {
  return `${productContext(args)}

Rédige le contenu TikTok pour ce produit : description courte, hook d'ouverture, et une liste de hashtags pertinents (mix hashtags larges et de niche).`;
}
