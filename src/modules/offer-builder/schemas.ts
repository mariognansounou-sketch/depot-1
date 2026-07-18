import { z } from "zod";

export const offerSchema = z.object({
  recommendedPrice: z.object({
    value: z.number().min(0),
    reasoning: z.string().describe("Pourquoi ce prix est le meilleur équilibre conversion/marge, en français"),
  }),
  bonuses: z.array(z.string()).min(1).max(6),
  guarantees: z.array(z.string()).min(1).max(4),
  urgency: z.array(z.string()).min(1).max(4),
  packs: z.array(
    z.object({ name: z.string(), description: z.string(), suggestedPrice: z.number().min(0) }),
  ).min(1).max(4),
  socialProof: z.array(z.string()).min(1).max(4),
});
export type OfferResult = z.infer<typeof offerSchema>;
