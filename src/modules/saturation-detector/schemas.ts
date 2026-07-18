import { z } from "zod";

export const saturationInterpretationSchema = z.object({
  saturationLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  saturationPercent: z.number().int().min(0).max(100),
  recommendation: z.string().describe("Recommandation actionnable en français"),
  reasoning: z.string().describe("Explique comment les signaux mènent à ce niveau de saturation"),
});
export type SaturationInterpretation = z.infer<typeof saturationInterpretationSchema>;
