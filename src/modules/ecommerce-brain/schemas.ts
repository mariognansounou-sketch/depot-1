import { z } from "zod";

export const brainInsightsSchema = z.object({
  insights: z
    .array(z.string())
    .min(3)
    .max(8)
    .describe("Observations personnalisées basées sur les statistiques réelles fournies, en français"),
  recommendation: z.string().describe("Une recommandation concrète pour la prochaine action, en français"),
});
export type BrainInsightsResult = z.infer<typeof brainInsightsSchema>;
