import { z } from "zod";

export const audienceProfileSchema = z.object({
  idealClient: z.object({
    summary: z.string().describe("Description courte du client idéal, en français"),
    segments: z.array(z.string()).min(1).max(6),
  }),
  demographics: z.object({
    ageRange: z.string(),
    genderSkew: z.string(),
    profession: z.string(),
    location: z.string(),
    purchasingPower: z.string(),
  }),
  motivations: z.array(z.string()).min(2).max(8).describe("Pourquoi ce client achèterait, en français"),
  interests: z.array(z.string()).min(5).max(20).describe("Centres d'intérêt Facebook à cibler"),
  behaviors: z.array(z.string()).min(2).max(10).describe("Comportements Facebook Ads pertinents"),
  lookalikeNotes: z.string().describe("Conseil pour construire une audience similaire (lookalike), en français"),
});
export type AudienceProfileResult = z.infer<typeof audienceProfileSchema>;
