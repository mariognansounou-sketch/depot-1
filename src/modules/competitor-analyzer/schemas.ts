import { z } from "zod";

export const structureSegmentSchema = z.object({
  fromSeconds: z.number().nullable().describe("Start of the segment in seconds, null if not a video"),
  toSeconds: z.number().nullable().describe("End of the segment in seconds, null if not a video"),
  label: z
    .enum([
      "INTRODUCTION",
      "PROBLEME",
      "AGITATION",
      "PRESENTATION_PRODUIT",
      "DEMONSTRATION",
      "PREUVE",
      "BENEFICES",
      "APPEL_A_ACTION",
    ])
    .describe("Phase of the ad narrative"),
  description: z.string().describe("What happens during this phase, in French"),
});

export const scoreBreakdownSchema = z.object({
  hook: z.number().int().min(0).max(20),
  offer: z.number().int().min(0).max(20),
  creativity: z.number().int().min(0).max(20),
  clarity: z.number().int().min(0).max(20),
  cta: z.number().int().min(0).max(20),
});

export const adAnalysisSchema = z.object({
  hook: z.object({
    text: z.string().describe("The hook line/moment, quoted or described"),
    score: z.number().int().min(0).max(10),
    reasoning: z.string().describe("Why this hook does or doesn't stop the scroll, in French"),
  }),
  structure: z.array(structureSegmentSchema).min(1).max(8),
  angle: z.object({
    name: z.string().describe("Short name of the main marketing angle, in French"),
    category: z.enum(["EMOTIONAL", "RATIONAL", "SOCIAL", "PROBLEM_SOLUTION"]),
    explanation: z.string(),
  }),
  emotion: z.object({
    primary: z
      .enum(["PEUR", "JOIE", "CURIOSITE", "URGENCE", "CONFIANCE", "DESIR", "FRUSTRATION"])
      .describe("Dominant emotion the ad leverages"),
    reasoning: z.string().describe("Why this emotion pushes the viewer to buy, in French"),
  }),
  targetAudience: z.object({
    profile: z.string().describe("Who is most likely to buy this, in French"),
    demographics: z.string().describe("Approximate age range, gender skew, life situation"),
    mainProblem: z.string().describe("The core problem/pain this audience has"),
  }),
  promises: z.array(z.string()).min(1).max(6),
  benefits: z.array(z.string()).min(1).max(6),
  objectionsHandled: z.array(z.string()).max(6),
  performanceScore: z.number().int().min(0).max(100),
  scoreBreakdown: scoreBreakdownSchema,
  strengths: z.array(z.string()).min(1).max(6),
  weaknesses: z.array(z.string()).min(1).max(6),
  improvements: z.array(z.string()).min(1).max(6),
});
export type AdAnalysisResult = z.infer<typeof adAnalysisSchema>;

export const commentAnalysisSchema = z.object({
  questions: z.array(z.string()).max(10),
  objections: z.array(z.string()).max(10),
  motivations: z.array(z.string()).max(10),
});
export type CommentAnalysisResult = z.infer<typeof commentAnalysisSchema>;

export const marketingAngleSchema = z.object({
  name: z.string(),
  category: z.enum(["EMOTIONAL", "RATIONAL", "SOCIAL", "PROBLEM_SOLUTION"]),
  description: z.string(),
  whyItWorks: z.string(),
  targetClient: z.string(),
  strengthScore: z.number().int().min(0).max(100),
  competitionLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  opportunityScore: z.number().int().min(0).max(100),
  isUsedByCompetitor: z.boolean(),
});
export type MarketingAngleResult = z.infer<typeof marketingAngleSchema>;

export const opportunityAnglesSchema = z.object({
  usedAngles: z.array(
    z.object({ competitorLabel: z.string(), angle: z.string(), category: z.string() }),
  ),
  angles: z.array(marketingAngleSchema).min(10).max(50),
});
export type OpportunityAnglesResult = z.infer<typeof opportunityAnglesSchema>;

export const videoScriptSegmentSchema = z.object({
  phase: z.enum(["HOOK", "PROBLEME", "SOLUTION", "DEMONSTRATION", "CTA"]),
  fromSeconds: z.number(),
  toSeconds: z.number(),
  voiceover: z.string().describe("What is said or shown, in French"),
  visualDirection: z.string().describe("What the viewer sees, in French"),
});

export const strategySchema = z.object({
  positioning: z.object({
    old: z.string().describe("How competitors currently position the product"),
    new: z.string().describe("The improved, differentiated positioning"),
  }),
  hooks: z.array(z.string()).min(3).max(6),
  videoScript: z.object({
    title: z.string(),
    segments: z.array(videoScriptSegmentSchema).min(4).max(6),
  }),
  adCopy: z.object({
    headline: z.string(),
    primaryText: z.string(),
    description: z.string(),
    cta: z.string(),
  }),
  rationale: z
    .string()
    .describe("Explain why this strategy should outperform the analyzed competitors, in French"),
});
export type StrategyResult = z.infer<typeof strategySchema>;

export const competitorComparisonSchema = z.object({
  rows: z.array(
    z.object({
      competitorLabel: z.string(),
      mainAngle: z.string(),
      strength: z.string(),
      weakness: z.string(),
    }),
  ),
  opportunityAngle: z.object({
    name: z.string(),
    reasoning: z.string(),
  }),
});
export type CompetitorComparisonResult = z.infer<typeof competitorComparisonSchema>;
