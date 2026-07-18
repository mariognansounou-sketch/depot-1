import { z } from "zod";

export const scriptSegmentSchema = z.object({
  phase: z.string().describe("Nom de la phase du script (ex: HOOK, PROBLÈME, SOLUTION, CTA)"),
  fromSeconds: z.number(),
  toSeconds: z.number(),
  content: z.string().describe("Ce qui est dit ou montré durant cette phase, en français"),
});

export const scriptResultSchema = z.object({
  title: z.string(),
  segments: z.array(scriptSegmentSchema).min(3).max(8),
  captionSuggestion: z.string().describe("Légende suggérée pour accompagner la vidéo"),
  hashtags: z.array(z.string()).max(10).optional(),
});
export type ScriptResult = z.infer<typeof scriptResultSchema>;
