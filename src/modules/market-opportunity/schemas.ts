import { z } from "zod";

export const marketOpportunitySchema = z.object({
  successElsewhere: z.object({ score: z.number().int().min(0).max(20), reasoning: z.string() }),
  localCompetition: z.object({ score: z.number().int().min(0).max(20), reasoning: z.string() }),
  purchasingPower: z.object({ score: z.number().int().min(0).max(20), reasoning: z.string() }),
  culturalFit: z.object({ score: z.number().int().min(0).max(20), reasoning: z.string() }),
  logistics: z.object({ score: z.number().int().min(0).max(20), reasoning: z.string() }),
  totalScore: z.number().int().min(0).max(100),
  message: z.string().describe("Synthèse actionnable en une ou deux phrases, en français"),
});
export type MarketOpportunityResult = z.infer<typeof marketOpportunitySchema>;
