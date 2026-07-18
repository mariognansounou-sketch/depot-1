import type { RawAdRecord } from "@/core/ports/ad-source.port";
import { ALL_ANGLE_EXAMPLES } from "./angle-taxonomy";

export const COMPETITOR_ANALYST_SYSTEM_PROMPT = `Tu es un expert Facebook Ads senior (ex-Meta, ex-Shopify) spécialisé en e-commerce et en marché africain (paiement à la livraison inclus).
Tu analyses des publicités concurrentes comme un stratège marketing, jamais comme un simple observateur.
Pour chaque publicité, tu dois expliquer POURQUOI elle fonctionne (ou pas) : quel problème client elle exploite, quelle émotion elle utilise, quel profil client elle cible, quelle promesse elle fait, quel mécanisme psychologique elle utilise.
Tu ne donnes jamais un score sans le justifier par un raisonnement clair.
Réponds toujours en français, de façon concise et actionnable.`;

export function buildAdAnalysisPrompt(ad: RawAdRecord, commentsText?: string[]): string {
  return `Analyse la publicité concurrente suivante comme un expert Facebook Ads.

DONNÉES DE LA PUBLICITÉ :
- Page / marque : ${ad.pageName ?? "inconnue"}
- Titre / headline : ${ad.headline ?? "non fourni"}
- Texte principal : ${ad.primaryText ?? "non fourni"}
- Description : ${ad.description ?? "non fournie"}
- CTA : ${ad.cta ?? "non fourni"}
- Type de média : ${ad.mediaType ?? "inconnu"}
- Pays de diffusion : ${ad.countries?.join(", ") || "non précisé"}
- Langues : ${ad.languages?.join(", ") || "non précisé"}
- Nombre de variantes : ${ad.variantsCount ?? 1}
- Toujours active : ${ad.isActive ? "oui" : "non"}

${commentsText?.length ? `COMMENTAIRES CLIENTS OBSERVÉS :\n${commentsText.map((c) => `- ${c}`).join("\n")}` : ""}

Angles marketing de référence (inspiration, tu peux en proposer d'autres) : ${ALL_ANGLE_EXAMPLES.join(", ")}.

Fournis une analyse complète : hook (et pourquoi il arrête le scroll), structure narrative de la publicité, angle marketing principal, émotion dominante et pourquoi elle pousse à l'achat, profil du client cible et son problème principal, promesses, bénéfices, objections traitées, forces, faiblesses, améliorations possibles, et un score de performance sur 100 décomposé en Hook/Offre/Créativité/Clarté/CTA (chacun sur 20).`;
}

export function buildCommentAnalysisPrompt(commentsText: string[]): string {
  return `Voici des commentaires laissés par des internautes sous une publicité Facebook Ads :

${commentsText.map((c) => `- ${c}`).join("\n")}

Extrait :
1. Les questions fréquentes des clients potentiels.
2. Les objections exprimées (prix, confiance, qualité, livraison...).
3. Les motivations d'achat exprimées ou implicites.`;
}

export function buildOpportunityAnglesPrompt(args: {
  productName: string;
  usedAngles: { competitorLabel: string; angle: string; category: string }[];
}): string {
  return `Produit : ${args.productName}

Angles marketing déjà utilisés par les concurrents observés :
${args.usedAngles.map((a) => `- ${a.competitorLabel} : "${a.angle}" (${a.category})`).join("\n") || "Aucun angle concurrent observé pour l'instant."}

Génère une liste de 20 à 50 angles marketing pour ce produit, classés par catégorie (EMOTIONAL, RATIONAL, SOCIAL, PROBLEM_SOLUTION). Pour chaque angle déjà repéré chez un concurrent, marque isUsedByCompetitor=true. Priorise les angles à fort potentiel et faible concurrence (opportunityScore élevé). Sois concret : chaque angle doit avoir une description, une explication du pourquoi il peut fonctionner, un client cible, et une estimation du niveau de concurrence.`;
}

export function buildStrategyPrompt(args: {
  productName: string;
  targetCountry?: string;
  analyses: {
    competitorLabel: string;
    angle: string;
    hook: string;
    emotion: string;
    targetAudience: string;
    weaknesses: string[];
  }[];
}): string {
  return `Produit : ${args.productName}
Marché cible : ${args.targetCountry ?? "Afrique de l'Ouest, paiement à la livraison"}

Voici l'analyse de ${args.analyses.length} publicité(s) concurrente(s) :
${args.analyses
  .map(
    (a, i) => `
Concurrent ${i + 1} (${a.competitorLabel}) :
- Angle : ${a.angle}
- Hook : ${a.hook}
- Émotion : ${a.emotion}
- Cible : ${a.targetAudience}
- Faiblesses : ${a.weaknesses.join(", ") || "aucune identifiée"}`,
  )
  .join("\n")}

À partir de cette analyse, crée une stratégie SUPÉRIEURE sans copier les concurrents :
1. Un nouveau positionnement (compare l'ancien positionnement générique au nouveau, plus différenciant).
2. 3 à 6 nouveaux hooks percutants.
3. Un script vidéo complet structuré (HOOK, PROBLÈME, SOLUTION, DÉMONSTRATION, CTA) avec minutage.
4. Un texte publicitaire complet (headline, texte principal, description, CTA) optimisé pour la conversion, le paiement à la livraison et le marché africain.
5. Explique en une phrase pourquoi cette stratégie devrait surperformer les concurrents analysés.`;
}

export function buildComparisonPrompt(args: {
  productName: string;
  competitors: { label: string; angle: string; strength: string; weakness: string }[];
}): string {
  return `Produit : ${args.productName}

Comparatif concurrentiel :
${args.competitors.map((c) => `- ${c.label} : angle "${c.angle}", force: ${c.strength}, faiblesse: ${c.weakness}`).join("\n")}

Synthétise ce comparatif en tableau (une ligne par concurrent) et identifie UN angle d'opportunité clairement inexploité par ces concurrents, avec le raisonnement.`;
}
