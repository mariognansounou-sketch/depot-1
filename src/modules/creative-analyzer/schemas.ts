import { z } from "zod";

export const creativeAnalysisSchema = z.object({
  hookAttention: z.object({
    score: z.number().int().min(0).max(10),
    reasoning: z.string().describe("La créative arrête-t-elle le scroll dans la première seconde ? Pourquoi."),
  }),
  structure: z
    .array(
      z.object({
        phase: z.enum(["DEBUT", "PROBLEME", "DEMONSTRATION", "BENEFICES", "PREUVE", "APPEL_A_ACTION"]),
        description: z.string(),
      }),
    )
    .min(2)
    .max(8),
  visualAnalysis: z.object({
    quality: z.string().describe("Qualité visuelle générale"),
    productClarity: z.string().describe("Le produit est-il montré clairement ?"),
    demonstration: z.string().describe("Le produit est-il démontré en usage ?"),
    humanPresence: z.string().describe("Présence humaine et son effet"),
    emotion: z.string().describe("Émotion transmise visuellement"),
    beforeAfter: z.string().describe("Présence et qualité d'un effet avant/après, si pertinent"),
  }),
  persuasionAnalysis: z.object({
    socialProof: z.string(),
    urgency: z.string(),
    scarcity: z.string(),
    guarantee: z.string(),
    trust: z.string(),
  }),
  strengths: z.array(z.string()).min(1).max(6),
  weaknesses: z.array(z.string()).min(1).max(6),
  improvements: z.array(z.string()).min(1).max(6),
});
export type CreativeAnalysisResult = z.infer<typeof creativeAnalysisSchema>;
