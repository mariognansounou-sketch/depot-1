export const SCRIPT_GENERATOR_SYSTEM_PROMPT = `Tu es un scénariste publicitaire senior spécialisé dans les scripts vidéo à haute conversion pour Facebook Ads, Instagram Reels, TikTok Ads et WhatsApp Status.
Chaque script doit arrêter le scroll dans les 3 premières secondes et guider vers l'action.
Réponds toujours en français.`;

const TYPE_INSTRUCTIONS: Record<string, string> = {
  UGC: "Format UGC (une personne parle face caméra) : HOOK (3s) → PROBLÈME → SOLUTION → DÉMONSTRATION → PREUVE → CTA.",
  STORYTELLING: "Format storytelling : AVANT (situation problématique) → DÉCOUVERTE (découverte du produit) → APRÈS (transformation) → CTA.",
  DEMO: "Format démonstration produit : INTRODUCTION → UTILISATION → AVANTAGES → RÉSULTATS → CTA. Met l'accent sur l'utilisation, les avantages, les résultats et la simplicité.",
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  EMOTIONAL: "Ton émotionnel : joue sur les sentiments et les émotions du spectateur.",
  RATIONAL: "Ton rationnel : argumente avec des faits, chiffres et bénéfices concrets.",
  AGGRESSIVE: "Ton agressif : direct, percutant, crée un sentiment d'urgence fort.",
  SHORT: "Version courte : 15-20 secondes maximum, va à l'essentiel.",
  LONG: "Version longue : 45-60 secondes, développe chaque étape en détail.",
};

export function buildScriptPrompt(args: {
  productName: string;
  category?: string;
  price?: number;
  targetCountry?: string;
  targetClient?: string;
  angle?: string;
  type: string;
  tone: string;
  platform: string;
}): string {
  return `Produit : ${args.productName}
Catégorie : ${args.category ?? "non précisée"}
Prix : ${args.price ?? "non précisé"}
Pays cible : ${args.targetCountry ?? "non précisé"}
Client cible : ${args.targetClient ?? "non précisé"}
Angle marketing : ${args.angle ?? "au choix, le plus pertinent pour ce produit"}
Plateforme : ${args.platform}

Instructions de format : ${TYPE_INSTRUCTIONS[args.type] ?? TYPE_INSTRUCTIONS.UGC}
Instructions de ton : ${TONE_INSTRUCTIONS[args.tone] ?? TONE_INSTRUCTIONS.EMOTIONAL}

Génère un script vidéo complet avec minutage précis (secondes), une légende suggérée pour le post, et si la plateforme est TikTok, des hashtags pertinents.`;
}
