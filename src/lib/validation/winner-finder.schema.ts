import { z } from "zod";

export const winnerFinderFiltersSchema = z.object({
  query: z.string().min(2).max(120),
  countries: z.array(z.string().length(2)).max(10).default([]),
  category: z.string().max(60).optional(),
  minDurationDays: z.number().int().min(0).max(365).optional(),
  language: z.string().max(10).optional(),
  physicalProductOnly: z.boolean().optional(),
  codCompatible: z.boolean().optional(),
});

export type WinnerFinderFiltersInput = z.infer<typeof winnerFinderFiltersSchema>;
