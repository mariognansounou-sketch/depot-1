import { z } from "zod";

export const supplierRecommendationSchema = z.object({
  recommendedSupplierName: z.string(),
  reasoning: z.string().describe("Pourquoi ce fournisseur est le meilleur choix parmi les candidats, en français"),
  riskWarnings: z.array(z.string()).max(6).describe("Points de vigilance à vérifier avant de commander"),
});
export type SupplierRecommendationResult = z.infer<typeof supplierRecommendationSchema>;
