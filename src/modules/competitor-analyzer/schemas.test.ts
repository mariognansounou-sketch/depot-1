import { describe, expect, it } from "vitest";
import { adAnalysisSchema, scoreBreakdownSchema } from "./schemas";

const validScoreBreakdown = { hook: 15, offer: 18, creativity: 12, clarity: 16, cta: 14 };

describe("scoreBreakdownSchema", () => {
  it("accepts values within 0-20 for every criterion", () => {
    expect(scoreBreakdownSchema.parse(validScoreBreakdown)).toEqual(validScoreBreakdown);
  });

  it("rejects a criterion above 20", () => {
    expect(() => scoreBreakdownSchema.parse({ ...validScoreBreakdown, hook: 21 })).toThrow();
  });

  it("rejects a negative criterion", () => {
    expect(() => scoreBreakdownSchema.parse({ ...validScoreBreakdown, cta: -1 })).toThrow();
  });
});

describe("adAnalysisSchema", () => {
  const validAnalysis = {
    hook: { text: "Vous avez encore ce problème ?", score: 8, reasoning: "Interpelle directement le spectateur." },
    structure: [
      { fromSeconds: 0, toSeconds: 3, label: "PROBLEME", description: "Présente le problème." },
      { fromSeconds: 3, toSeconds: 15, label: "DEMONSTRATION", description: "Montre le produit en action." },
    ],
    angle: { name: "Sécurité", category: "EMOTIONAL", explanation: "Rassure sur la sécurité du produit." },
    emotion: { primary: "CONFIANCE", reasoning: "La preuve sociale inspire confiance." },
    targetAudience: {
      profile: "Parents de jeunes enfants",
      demographics: "25-45 ans, majoritairement des mères",
      mainProblem: "Peur de perdre de vue leur enfant",
    },
    promises: ["Localisation en temps réel"],
    benefits: ["Tranquillité d'esprit"],
    objectionsHandled: ["Facilité d'installation"],
    performanceScore: 82,
    scoreBreakdown: validScoreBreakdown,
    strengths: ["Bonne démonstration produit"],
    weaknesses: ["CTA tardif"],
    improvements: ["Avancer le CTA à 20 secondes"],
  };

  it("accepts a well-formed AI analysis payload", () => {
    expect(() => adAnalysisSchema.parse(validAnalysis)).not.toThrow();
  });

  it("rejects an unknown emotion enum value (defense against model drift)", () => {
    expect(() =>
      adAnalysisSchema.parse({ ...validAnalysis, emotion: { primary: "ENNUI", reasoning: "x" } }),
    ).toThrow();
  });

  it("rejects a performanceScore above 100", () => {
    expect(() => adAnalysisSchema.parse({ ...validAnalysis, performanceScore: 150 })).toThrow();
  });
});
