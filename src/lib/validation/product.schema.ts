import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.string().max(60).optional(),
  description: z.string().max(2000).optional(),
  priceCost: z.number().min(0).optional(),
  priceSale: z.number().min(0).optional(),
  targetCountry: z.string().max(60).optional(),
});
