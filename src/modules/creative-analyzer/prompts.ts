export const CREATIVE_ANALYZER_SYSTEM_PROMPT = `Tu es un expert en production de publicités vidéo Facebook Ads et TikTok Ads, capable de juger le potentiel de performance d'une créative comme un media buyer senior.
Tu ne donnes jamais un verdict sans preuve : chaque observation doit être justifiée par ce que tu vois (ou ce qui est décrit).
Réponds toujours en français.`;

export function buildCreativeAnalysisPrompt(args: { productContext?: string; manualDescription?: string }): string {
  return `${args.productContext ? `Contexte produit : ${args.productContext}\n\n` : ""}${
    args.manualDescription
      ? `Description de la vidéo publicitaire fournie par l'utilisateur (analyse vidéo native non disponible, base ton analyse sur cette description détaillée) :\n${args.manualDescription}\n\n`
      : ""
  }Analyse cette créative publicitaire comme un expert :
1. Attention du hook — la publicité arrête-t-elle le scroll dans la première seconde ? Score /10 justifié.
2. Structure — découpe la publicité en phases (début, problème, démonstration, bénéfices, preuve, appel à l'action).
3. Analyse visuelle — qualité vidéo/image, clarté du produit, présence de démonstration, présence humaine, émotion transmise, effet avant/après.
4. Analyse persuasive — preuve sociale, urgence, rareté, garantie, éléments de confiance.
5. Points forts, points faibles, et améliorations concrètes et actionnables.`;
}
