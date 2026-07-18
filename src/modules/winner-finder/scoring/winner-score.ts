import { clamp } from "@/lib/utils";

export interface WinnerSignals {
  durationDays: number;
  variantsCount: number;
  countriesCount: number;
  isActive: boolean;
}

export interface WinnerScoreBreakdown {
  winnerScore: number;
  opportunity: number;
  competitionLevel: number;
  launchPotential: number;
  reasoning: string;
}

/**
 * Deterministic, explainable scoring model for the Winner Finder.
 *
 * We intentionally do NOT call the LLM for every single search result —
 * with dozens of candidates per search that would be slow and expensive.
 * Instead every sub-score is computed from transparent rules and the
 * reasoning string is composed from those same numbers, so the user always
 * sees *why* a product scored the way it did (never a bare number). Deeper,
 * LLM-generated reasoning is available on-demand via the Competitor
 * Analyzer / Product Validator once a candidate is shortlisted.
 */
export function computeWinnerScore(signals: WinnerSignals): WinnerScoreBreakdown {
  const durationScore = durationSubScore(signals.durationDays);
  const variantsScore = clamp(signals.variantsCount * 5, 0, 20);
  const countriesScore = clamp(signals.countriesCount * 4, 0, 20);
  const activeBonus = signals.isActive ? 20 : 0;

  const winnerScore = clamp(durationScore + variantsScore + countriesScore + activeBonus, 0, 100);

  // Competition is a proxy: ads that have run long, in many countries, with
  // many variants tend to attract copycats faster than fresh, narrow ones.
  const competitionLevel = clamp(
    Math.round(durationScore * 0.5 + countriesScore * 0.7 + variantsScore * 0.3),
    0,
    100,
  );

  // Opportunity rewards strong winner signals while penalizing high
  // estimated competition — the sweet spot is "proven demand, not yet
  // flooded".
  const opportunity = clamp(Math.round(winnerScore - competitionLevel * 0.4), 0, 100);

  const launchPotential = clamp(Math.round(winnerScore * 0.6 + opportunity * 0.4), 0, 100);

  const reasoning = buildReasoning(signals, {
    durationScore,
    variantsScore,
    countriesScore,
    activeBonus,
    competitionLevel,
    opportunity,
  });

  return { winnerScore, opportunity, competitionLevel, launchPotential, reasoning };
}

function durationSubScore(days: number): number {
  if (days >= 90) return 40;
  if (days >= 30) return 32;
  if (days >= 14) return 22;
  if (days >= 7) return 12;
  return 4;
}

function buildReasoning(
  signals: WinnerSignals,
  parts: {
    durationScore: number;
    variantsScore: number;
    countriesScore: number;
    activeBonus: number;
    competitionLevel: number;
    opportunity: number;
  },
): string {
  const sentences: string[] = [];

  sentences.push(
    signals.durationDays >= 30
      ? `Cette publicité tourne depuis ${signals.durationDays} jours, un signal fort de validation marché (+${parts.durationScore} pts).`
      : `Cette publicité tourne depuis seulement ${signals.durationDays} jours, encore trop récent pour confirmer sa performance (+${parts.durationScore} pts).`,
  );

  sentences.push(
    signals.variantsCount > 1
      ? `${signals.variantsCount} variantes créatives détectées, signe d'un test actif et d'un budget engagé (+${parts.variantsScore} pts).`
      : `Une seule variante détectée pour l'instant — la campagne est peut-être encore en phase de test (+${parts.variantsScore} pts).`,
  );

  sentences.push(
    signals.countriesCount > 1
      ? `Diffusée dans ${signals.countriesCount} pays, ce qui confirme une demande qui dépasse un marché isolé (+${parts.countriesScore} pts).`
      : `Diffusée dans un seul pays pour l'instant (+${parts.countriesScore} pts).`,
  );

  sentences.push(
    signals.isActive
      ? "La publicité est toujours active aujourd'hui : le produit n'a pas été abandonné."
      : "La publicité n'est plus active — vérifiez si le produit a été retiré ou remplacé par une nouvelle créative.",
  );

  sentences.push(
    parts.competitionLevel >= 60
      ? `Niveau de concurrence estimé élevé (${parts.competitionLevel}/100) : plusieurs signaux suggèrent un marché déjà disputé.`
      : `Niveau de concurrence estimé modéré à faible (${parts.competitionLevel}/100) : une fenêtre d'opportunité est probable.`,
  );

  return sentences.join(" ");
}
