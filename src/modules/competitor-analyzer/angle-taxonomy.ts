/**
 * Reference taxonomy of marketing angles, grounding the AI's angle
 * detection and opportunity-gap analysis so results stay consistent
 * across ads and products instead of inventing ad-hoc labels every time.
 * The AI can still surface angles outside this list — this is inspiration,
 * not a hard constraint.
 */
export const ANGLE_TAXONOMY: Record<
  "EMOTIONAL" | "RATIONAL" | "SOCIAL" | "PROBLEM_SOLUTION",
  string[]
> = {
  EMOTIONAL: [
    "Peur d'un problème",
    "Sécurité",
    "Amour / Affection",
    "Protection familiale",
    "Fierté",
    "Confiance",
    "Soulagement",
    "Nostalgie",
    "Curiosité",
  ],
  RATIONAL: [
    "Gain de temps",
    "Économie d'argent",
    "Performance",
    "Facilité d'utilisation",
    "Durabilité",
    "Praticité",
    "Innovation technologique",
  ],
  SOCIAL: [
    "Statut social",
    "Appartenance",
    "Approbation sociale",
    "Image professionnelle",
    "Tendance / Effet de mode",
  ],
  PROBLEM_SOLUTION: [
    "Le problème que personne ne remarque",
    "Avant / Après",
    "La solution que les experts cachent",
    "L'erreur à ne plus jamais commettre",
    "La méthode alternative",
  ],
};

export const ALL_ANGLE_EXAMPLES = Object.values(ANGLE_TAXONOMY).flat();
