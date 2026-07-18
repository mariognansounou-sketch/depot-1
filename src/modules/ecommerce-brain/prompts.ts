import type { BrainStats } from "./stats";

export const ECOMMERCE_BRAIN_SYSTEM_PROMPT = `Tu es la mémoire IA personnelle d'un e-commerçant : tu analyses son historique réel sur la plateforme pour repérer des tendances et le conseiller comme le ferait un mentor qui suit son activité depuis le début.
Tu ne dois JAMAIS inventer de chiffres — base-toi uniquement sur les statistiques fournies. Si l'historique est trop limité pour une tendance fiable, dis-le clairement plutôt que d'extrapoler.
Réponds toujours en français.`;

export function buildBrainInsightsPrompt(stats: BrainStats): string {
  return `Statistiques réelles de l'activité de ce e-commerçant sur AdWinner OS :

- Produits suivis au total : ${stats.totalProducts}
- Répartition par statut : ${Object.entries(stats.productsByStatus)
    .map(([status, count]) => `${status}: ${count}`)
    .join(", ") || "aucune donnée"}
- Validations produit effectuées : ${stats.totalValidations} (score moyen : ${
    stats.avgValidationScore ?? "non disponible"
  }/100)
- Répartition des décisions de lancement : ${Object.entries(stats.decisionsBreakdown)
    .map(([decision, count]) => `${decision}: ${count}`)
    .join(", ") || "aucune donnée"}
- Créatives analysées : ${stats.totalCreativeAnalyses} (score moyen d'attention du hook : ${
    stats.avgHookScore ?? "non disponible"
  }/10)
- Rapports de saturation générés : ${stats.totalSaturationReports}
- Scripts générés : ${stats.totalScripts}
- Textes publicitaires générés : ${stats.totalCopyAssets}
- Modules les plus utilisés récemment : ${stats.topModules.join(", ") || "aucune donnée"}

À partir de CES chiffres uniquement, génère 3 à 8 observations personnalisées et une recommandation pour la prochaine action à mener. Si l'historique est encore trop léger pour une vraie tendance, dis-le et encourage l'utilisateur à continuer à utiliser la plateforme pour affiner ses futures recommandations.`;
}
