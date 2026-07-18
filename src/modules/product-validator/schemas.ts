import { z } from "zod";

export const productValidationSchema = z.object({
  demandScore: z.object({ score: z.number().int().min(0).max(20), reasoning: z.string() }),
  competitionScore: z.object({ score: z.number().int().min(0).max(20), reasoning: z.string() }),
  marginScore: z.object({ score: z.number().int().min(0).max(20), reasoning: z.string() }),
  logisticsScore: z.object({ score: z.number().int().min(0).max(20), reasoning: z.string() }),
  adPotentialScore: z.object({ score: z.number().int().min(0).max(20), reasoning: z.string() }),
  totalScore: z.number().int().min(0).max(100),
  decision: z.enum(["LAUNCH", "TEST", "AVOID"]),
  reasoning: z.string().describe("Synthèse globale expliquant la décision, en français"),
});
export type ProductValidationResult = z.infer<typeof productValidationSchema>;
